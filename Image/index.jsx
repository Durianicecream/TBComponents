/*
 * @Author: TB 
 * @Date: 2018-10-25 12:13:12 
 * @Last Modified by: TB
 * @Last Modified time: 2018-10-25 12:17:49
 * 自适应图片组件 可指定图片比例
 */

import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import defaultImage from './loading.png'
import './index.less'

export default class Image extends React.Component {
	static propTypes = {
		src: PropTypes.string,
		ratio: PropTypes.number
	}

	static defaultProps = {
		src: '',
		ratio: 9 / 16
	}

	constructor() {
		super()
		this.state = {
			loading: true
		}
	}

	render() {
		const { ratio, src, className, style, ...otherProps } = this.props
		const classes = classnames('fc-image', className)
		return (
			<div
				className={classes}
				style={{
					backgroundImage: `url('${
						this.state.loading ? defaultImage : this.props.src
					}')`,
					paddingBottom: `${ratio * 100}%`,
					...style
				}}
				{...otherProps}
			>
				<img
					src={src}
					onLoad={() =>
						this.setState({
							loading: false
						})
					}
				/>
			</div>
		)
	}
}
