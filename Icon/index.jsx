import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './index.less'

export default function Icon(props) {
	const { name, className, ...otherProps } = props
	const classes = classnames('iconfont', `icon-${name}`, className)

	return <i className={classes} {...otherProps} />
}

Icon.propTypes = {
	name: PropTypes.string.isRequired
}
