/*
 * @Author: TB 
 * @Date: 2018-11-01 16:03:34 
 * @Last Modified by: TB
 * @Last Modified time: 2018-11-02 14:11:11
 * 自动调整省略的多行文本
 */

import React from 'react'
import PropTypes from 'prop-types'

export default class ellipsisText extends React.Component {
	static propTypes = {
		auto: PropTypes.boolean, // 自动适应
		clamp: PropTypes.number, // 固定行数
		height: PropTypes.number, // 指定内容区域高度
		character: PropTypes.string, // 自定义省略号
		children: PropTypes.string, // 内容文本
		className: PropTypes.string // 类名
	}

	static defaultProps = {
		auto: true,
		clamp: 0,
		height: 0,
		character: '…',
		children: '',
		className: ''
	}

	constructor(props) {
		super(props)
	}

	initText = (element) => {
		if (!element) return
		this.textElem = element
		this.clamp()
	}

	clamp = () => {
		// 计算最大高度
		let clampValue
		if (this.props.clamp) {
			clampValue = this.props.clamp
		} else if (this.props.height) {
			clampValue = getMaxLines(this.textElem, parseInt(clampValue))
		} else {
			clampValue = getMaxLines(this.textElem)
		}
		const height = getMaxHeight(this.textElem, clampValue)

		// 重置textElement值
		this.textElem.innerHTML = this.props.children

		// 如果内容超出高度 则执行截取逻辑
		if (height < this.textElem.clientHeight) {
			this.chunks = null
			this.splitChar = ' ' //　默认根据空格截取
			this.truncate(height)
		}
	}

	truncate = (maxHeight) => {
		if (!maxHeight) {
			return
		}

		const regex = new RegExp(`${this.props.character}$`)
		const textValue = this.textElem.textContent.replace(regex, '')

		if (!this.chunks) {
			this.chunks = textValue.split(this.splitChar)
		}

		// 截取最后一个chunk
		if (this.chunks.length > 1) {
			this.chunks.pop()
			this.applyEllipsis(this.chunks.join(this.splitChar))
		} else {
			this.chunks = null
		}

		if (this.chunks) {
			if (maxHeight >= this.textElem.clientHeight) {
				// bingo!
				return this.textElem.textContent
			}
		} else {
			// 如果无法再截取chunks
			if (this.splitChar !== '') {
				// 尝试根据字节切分
				this.chunks = null
				this.splitChar = ''
			} else {
				return ''
			}
		}

		// 尝试重复截取
		return this.truncate(maxHeight)
	}

	/**
	 *	生成省略文本
	 *	@param str
	 */

	applyEllipsis = (str) => {
		this.textElem.textContent = str + this.props.character
	}

	componentDidMount() {
		window.addEventListener('resize', this.clamp)
	}

	componentDidUpdate = (prevProps) => {
		if (this.props.children !== prevProps.children) {
			this.clamp(this.textElem)
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.clamp)
	}

	render() {
		return <div ref={this.initText}>{this.props.children}</div>
	}
}

/**
 * 返回节点属性
 * @param {HTMLElement} elem 节点
 * @param {string} prop 属性名称
 * @return {number}
 */
function computeStyle(elem, prop) {
	if (!getComputedStyle) {
		getComputedStyle = function(el, pseudo) {
			this.el = el
			this.getPropertyValue = function(prop) {
				var re = /(\-([a-z]){1})/g
				if (prop == 'float') prop = 'styleFloat'
				if (re.test(prop)) {
					prop = prop.replace(re, function() {
						return arguments[2].toUpperCase()
					})
				}
				return el.currentStyle && el.currentStyle[prop]
					? el.currentStyle[prop]
					: null
			}
			return this
		}
	}

	return getComputedStyle(elem, null).getPropertyValue(prop)
}

/**
 * 计算最大的文本行数(基于行高)
 * @param {HTMLElement} element DOM节点
 * @param {number} height  节点高度
 * @return {number}
 */
function getMaxLines(element, height) {
	var availHeight = height || element.clientHeight,
		lineHeight = getLineHeight(element)

	return Math.max(Math.floor(availHeight / lineHeight), 0)
}

/**
 * 计算最大的文本元素高度(基于行高)
 * @param {HTMLElement} element DOM节点
 * @param {number} clamp 文本行数
 * @return {number}
 */
function getMaxHeight(element, clamp) {
	var lineHeight = getLineHeight(element)
	return lineHeight * clamp
}

/**
 * 获取元素的行高
 * @param {HTMLElement} elem
 * @return {number}
 */
function getLineHeight(elem) {
	var lh = computeStyle(elem, 'line-height')
	if (lh == 'normal') {
		lh = parseInt(computeStyle(elem, 'font-size')) * 1.5
	}
	return parseInt(lh)
}
