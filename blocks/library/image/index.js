/**
 * WordPress dependencies
 */
import { __ } from 'i18n';
import Button from 'components/button';
import Placeholder from 'components/placeholder';

/**
 * Internal dependencies
 */
import './style.scss';
import { registerBlock, query } from '../../api';
import Editable from '../../editable';

const { attr, children } = query;

/**
 * Returns an attribute setter with behavior that if the target value is
 * already the assigned attribute value, it will be set to undefined.
 *
 * @param  {string}   align Alignment value
 * @return {Function}       Attribute setter
 */
function toggleAlignment( align ) {
	return ( attributes, setAttributes ) => {
		const nextAlign = attributes.align === align ? undefined : align;
		setAttributes( { align: nextAlign } );
	};
}

registerBlock( 'core/image', {
	title: __( 'Image' ),

	icon: 'format-image',

	category: 'common',

	attributes: {
		url: attr( 'img', 'src' ),
		alt: attr( 'img', 'alt' ),
		caption: children( 'figcaption' )
	},

	controls: [
		{
			icon: 'align-left',
			title: __( 'Align left' ),
			isActive: ( { align } ) => 'left' === align,
			onClick: toggleAlignment( 'left' )
		},
		{
			icon: 'align-center',
			title: __( 'Align center' ),
			isActive: ( { align } ) => 'center' === align,
			onClick: toggleAlignment( 'center' )
		},
		{
			icon: 'align-right',
			title: __( 'Align right' ),
			isActive: ( { align } ) => 'right' === align,
			onClick: toggleAlignment( 'right' )
		},
		{
			icon: 'align-full-width',
			title: __( 'Wide width' ),
			isActive: ( { align } ) => 'wide' === align,
			onClick: toggleAlignment( 'wide' )
		}
	],

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align ) {
			return { 'data-align': align };
		}
	},

	edit( { attributes, setAttributes, focus, setFocus } ) {
		const { url, alt, caption } = attributes;

		if ( ! url ) {
			return (
				<Placeholder
					instructions={ __( 'Drag image here or insert from media library' ) }
					icon="format-image"
					label={ __( 'Image' ) }
					className="blocks-image">
					<Button isLarge>
						{ __( 'Insert from Media Library' ) }
					</Button>
				</Placeholder>
			);
		}

		const focusCaption = ( focusValue ) => setFocus( { editable: 'caption', ...focusValue } );

		return (
			<figure className="blocks-image">
				<img src={ url } alt={ alt } />
				{ ( caption && caption.length > 0 ) || !! focus ? (
					<Editable
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						focus={ focus && focus.editable === 'caption' ? focus : undefined }
						onFocus={ focusCaption }
						onChange={ ( value ) => setAttributes( { caption: value } ) }
						inline
						inlineToolbar
					/>
				) : null }
			</figure>
		);
	},

	save( { attributes } ) {
		const { url, alt, caption, align = 'none' } = attributes;
		const img = <img src={ url } alt={ alt } className={ `align${ align }` } />;

		if ( ! caption || ! caption.length ) {
			return img;
		}

		return (
			<figure>
				{ img }
				<figcaption>{ caption }</figcaption>
			</figure>
		);
	}
} );
