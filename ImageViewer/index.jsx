/*
 * @Author: TB 
 * @Date: 2018-10-25 12:22:05 
 * @Last Modified by: TB
 * @Last Modified time: 2018-10-25 12:23:13
 * 基于photoswipe 的图片查看器(仿微信)
 */

import React from 'react'
import PropTypes from 'prop-types'
import PhotoSwipe from 'photoswipe/dist/photoswipe.js'
import PhotoSwipeUI from 'photoswipe/dist/photoswipe-ui-default.js'

import 'photoswipe/dist/photoswipe.css'
import 'photoswipe/dist/default-skin/default-skin.css'

export default class ImageViewer extends React.Component {
	static propTypes = {
		images: PropTypes.arrayOf(PropTypes.string).isRequired,
		visible: PropTypes.bool,
		index: PropTypes.number,
		onClose: PropTypes.func,
		thumbnailDOM: PropTypes.element
	}

	static defaultProps = {
		visible: false,
		index: 0,
		onClose: () => {}
	}

	constructor(props) {
		super(props)
		this.viewer = null
	}

	initImageViewer = (element) => {
		if (!element) return
		const items = this.props.images.map((item) => {
			const img = new Image()
			img.src = item
			return {
				src: item,
				w: img.naturalWidth,
				h: img.naturalHeight
			}
		})

		const options = {
			index: this.props.index,
			closeOnScroll: false,
			loop: false,
			showHideOpacity: true
		}

		if (this.props.thumbnailDOM) {
			options.getThumbBoundsFn = () => {
				var pageYScroll =
					window.pageYOffset || document.documentElement.scrollTop
				// optionally get horizontal scroll
				// get position of element relative to viewport
				var rect = this.props.thumbnailDOM.getBoundingClientRect()
				// w = width
				return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
			}
			// set thumbnailUrl to prevent flash
			if (items[this.props.index]) {
				const imgTag =
					this.props.thumbnailDOM.nodeName === 'IMG'
						? this.props.thumbnailDOM
						: this.props.thumbnailDOM.getElementsByTagName('img')[0]
				items[this.props.index].msrc = imgTag.getAttribute('src')
			}
		}

		// Initializes and opens PhotoSwipe
		this.viewer = new PhotoSwipe(element, PhotoSwipeUI, items, options)
		this.viewer.init()
		this.viewer.listen('close', () => {
			this.props.onClose()
		})
	}

	componentWillUnmount() {
		this.viewer && this.viewer.destroy()
	}

	render() {
		return (
			<div className="pswp" ref={this.initImageViewer}>
				{/* Background of PhotoSwipe.  It's a separate element as animating opacity is faster than rgba().  */}
				<div className="pswp__bg" />

				{/*  Slides wrapper with overflow:hidden.*/}
				<div className="pswp__scroll-wrap">
					{/* Container that holds slides. 
            PhotoSwipe keeps only 3 of them in the DOM to save memory.
            Don't modify these 3 pswp__item elements, data is added later on. */}
					<div className="pswp__container">
						<div className="pswp__item" />
						<div className="pswp__item" />
						<div className="pswp__item" />
					</div>

					{/* Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed */}
					<div className="pswp__ui pswp__ui--hidden">
						<div className="pswp__top-bar">
							{/* Controls are self-explanatory. Order can be changed. */}

							<div className="pswp__counter" />

							<button
								className="pswp__button pswp__button--close"
								title="关闭(Esc)"
							/>

							{/* element will get class pswp__preloader--active when preloader is running  */}
							<div className="pswp__preloader">
								<div className="pswp__preloader__icn">
									<div className="pswp__preloader__cut">
										<div className="pswp__preloader__donut" />
									</div>
								</div>
							</div>
						</div>

						<div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
							<div className="pswp__share-tooltip" />
						</div>

						<button
							className="pswp__button pswp__button--arrow--left"
							title="Previous (arrow left)"
						/>

						<button
							className="pswp__button pswp__button--arrow--right"
							title="Next (arrow right)"
						/>

						<div className="pswp__caption">
							<div className="pswp__caption__center" />
						</div>
					</div>
				</div>
			</div>
		)
	}
}
