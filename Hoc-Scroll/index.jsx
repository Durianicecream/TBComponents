import React from 'react'
import { debounce } from 'lodash'

export default function(Component) {
	return class Scroll extends React.Component {
		constructor() {
			super()
			this.state = {
				scrollTop: 0,
				clientHeight: document.body.clientHeight,
				scrollHeight: document.body.scrollHeight
			}
		}

		handleScroll = debounce((event) => {
			// 滚动的高度
			const scrollTop =
				(event.srcElement
					? event.srcElement.documentElement.scrollTop
					: false) ||
				window.pageYOffset ||
				(event.srcElement ? event.srcElement.body.scrollTop : 0)
			// 视窗高度
			const clientHeight =
				(event.srcElement && event.srcElement.documentElement.clientHeight) ||
				document.body.clientHeight
			// 页面高度
			const scrollHeight =
				(event.srcElement && event.srcElement.documentElement.scrollHeight) ||
				document.body.scrollHeight
			this.setState({
				scrollTop,
				clientHeight,
				scrollHeight
			})
		}, 500)

		componentDidMount() {
			window.addEventListener('scroll', this.handleScroll)
		}
		componentWillUnmount() {
			window.removeEventListener('scroll', this.handleScroll)
		}
		render() {
			return <Component scroll={this.state} />
		}
	}
}
