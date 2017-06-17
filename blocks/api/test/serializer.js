/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import serialize, { getCommentAttributes, getSaveContent, serializeAttributes } from '../serializer';
import { getBlockTypes, registerBlockType, unregisterBlockType } from '../registration';

describe( 'block serializer', () => {
	afterEach( () => {
		getBlockTypes().forEach( block => {
			unregisterBlockType( block.name );
		} );
	} );

	describe( 'getSaveContent()', () => {
		context( 'function save', () => {
			it( 'should return string verbatim', () => {
				const saved = getSaveContent(
					( { attributes } ) => attributes.fruit,
					{ fruit: 'Bananas' }
				);

				expect( saved ).to.equal( 'Bananas' );
			} );

			it( 'should return element as string if save returns element', () => {
				const { createElement } = wp.element;
				const saved = getSaveContent(
					( { attributes } ) => createElement( 'div', null, attributes.fruit ),
					{ fruit: 'Bananas' }
				);

				expect( saved ).to.equal( '<div>Bananas</div>' );
			} );
		} );

		context( 'component save', () => {
			it( 'should return element as string', () => {
				const { Component, createElement } = wp.element;
				const saved = getSaveContent(
					class extends Component {
						render() {
							return createElement( 'div', null, this.props.attributes.fruit );
						}
					},
					{ fruit: 'Bananas' }
				);

				expect( saved ).to.equal( '<div>Bananas</div>' );
			} );
		} );
	} );

	describe( 'getCommentAttributes()', () => {
		it( 'should return an empty set if no attributes provided', () => {
			const attributes = getCommentAttributes( {}, {} );

			expect( attributes ).to.eql( {} );
		} );

		it( 'should only return attributes which cannot be inferred from the content', () => {
			const attributes = getCommentAttributes( {
				fruit: 'bananas',
				category: 'food',
				ripeness: 'ripe',
			}, {
				fruit: 'bananas',
			} );

			expect( attributes ).to.eql( {
				category: 'food',
				ripeness: 'ripe',
			} );
		} );

		it( 'should skip attributes whose values are undefined', () => {
			const attributes = getCommentAttributes( {
				fruit: 'bananas',
				ripeness: undefined,
			}, {} );

			expect( attributes ).to.eql( { fruit: 'bananas' } );
		} );
	} );

	describe( 'serializeAttributes()', () => {
		it( 'should not break HTML comments', () => {
			expect( serializeAttributes( { a: '-- and --' } ) ).to.equal( '{"a":"\\u002d\\u002d and \\u002d\\u002d"}' );
		} );
		it( 'should not break standard-non-compliant tools for "<"', () => {
			expect( serializeAttributes( { a: '< and <' } ) ).to.equal( '{"a":"\\u003c and \\u003c"}' );
		} );
		it( 'should not break standard-non-compliant tools for ">"', () => {
			expect( serializeAttributes( { a: '> and >' } ) ).to.equal( '{"a":"\\u003e and \\u003e"}' );
		} );
		it( 'should not break standard-non-compliant tools for "&"', () => {
			expect( serializeAttributes( { a: '& and &' } ) ).to.equal( '{"a":"\\u0026 and \\u0026"}' );
		} );
	} );

	describe( 'serialize()', () => {
		it( 'should serialize the post content properly', () => {
			const blockType = {
				attributes: ( rawContent ) => {
					return {
						content: rawContent,
					};
				},
				save( { attributes } ) {
					return <p dangerouslySetInnerHTML={ { __html: attributes.content } } />;
				},
			};
			registerBlockType( 'core/test-block', blockType );
			const blockList = [
				{
					name: 'core/test-block',
					attributes: {
						content: 'Ribs & Chicken',
						stuff: 'left & right -- but <not>',
					},
				},
			];
			const expectedPostContent = '<!-- wp:core/test-block {"stuff":"left \\u0026 right \\u002d\\u002d but \\u003cnot\\u003e"} -->\n<p>Ribs & Chicken</p>\n<!-- /wp:core/test-block -->';

			expect( serialize( blockList ) ).to.eql( expectedPostContent );
		} );
	} );
} );
