/*
 * @Desc 标签选择的组件, 可以支持单/多选，数据最多支持二层嵌套, 多选模式下支持点击取消
 * @Author: TB
 * @Date: 2019-07-08 09:56:54
 * @Last Modified by: TB
 * @Last Modified time: 2019-07-12 21:03:10
 */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Icon } from 'antd'

import './style'

// 单选多选判断
const SINGLE = 'single'
const MUTIPLE = 'multiple'
const MORE_HEIGHT = 40

export default class TagChoose extends PureComponent {
  static propTypes = {
    type: PropTypes.oneOf(['single', 'multiple']), // ‘single’ 单选 'multiple' 多选
    list: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          value: PropTypes.number,
          label: PropTypes.string,
          list: PropTypes.shape({
            value: PropTypes.number,
            label: PropTypes.string
          })
        }),
        PropTypes.shape({
          value: PropTypes.number,
          label: PropTypes.string
        })
      ])
    ), // 可以是一维数组或者二维数组
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.number
    ]), // 传入undefined则重置全部状态，包括选中的category
    isShowExpand: PropTypes.bool, // 控制是否可以显示展开
    isShowUnlimit: PropTypes.bool, // 控制是否展示<不限>
    isNested: PropTypes.bool, // 控制是否渲染嵌套数据
    style: PropTypes.object,
    className: PropTypes.string
  }
  static defaultProps = {
    type: SINGLE,
    list: [],
    isShowExpand: true,
    isShowUnlimit: true,
    isNest: false
  }
  state = {
    isExpand: false, // 控制一级列表展开状态
    isChildExpand: false, // 控制二级列表展开状态
    currentCategoryId: undefined,
    canShowExpand: false,
    canChildShowExpand: false
  }

  componentDidMount() {
    // 测量元素的高度是否溢出，动态设置展开按钮显隐
    if (this.listRef.current) {
      this.setState({
        canShowExpand: this.listRef.current.scrollHeight > MORE_HEIGHT
      })
    }
    if (this.childListRef.current) {
      this.setState({
        canChildShowExpand: this.childListRef.current.scrollHeight > MORE_HEIGHT
      })
    }
  }

  componentDidUpdate(prevProps) {
    // 测量元素的高度是否溢出，动态设置展开按钮显隐
    if (this.listRef.current) {
      this.setState({
        canShowExpand: this.listRef.current.scrollHeight > MORE_HEIGHT
      })
    }
    if (this.childListRef.current) {
      this.setState({
        canChildShowExpand: this.childListRef.current.scrollHeight > MORE_HEIGHT
      })
    }
    // 如果传入值重置为空, 重置一级列表状态
    if (
      this.props.isNested &&
      this.props.value === undefined &&
      prevProps !== undefined
    ) {
      this.setState({
        currentCategoryId: undefined
      })
    }
  }

  listRef = React.createRef()
  childListRef = React.createRef()

  // 获取当前分类下的二级列表
  get currentList() {
    let currentList = []
    // 如果分类是无限，那么展示所有的标签
    if (this.state.currentCategoryId === undefined) {
      this.props.list.forEach(item => {
        item.list.forEach(item => {
          currentList.push(item)
        })
      })
      return currentList
    } else {
      // 如果有确定的分类
      const targetList = this.props.list.find(
        item => item.value === this.state.currentCategoryId
      )
      return targetList ? targetList.list : []
    }
  }
  handleTagClick = value => {
    const { type, onChange } = this.props
    if (type === SINGLE) {
      if (value !== this.props.value) {
        onChange(value)
      }
    } else {
      const listValue = this.props.value || []
      const hasChoose = listValue.findIndex(item => item === value) !== -1
      // 已选中的标签取消选择
      if (hasChoose) {
        onChange(listValue.filter(item => item !== value))
      } else {
        onChange([...listValue, value])
      }
    }
  }

  // 点击切换目录，并且切换二级视图
  handleCategoryClick = value => {
    this.setState({
      currentCategoryId: value
    })
  }

  /**
   * @description 渲染展开的图标
   * @param {bool} isChild
   */
  renderExpandIcon(isChild = false) {
    const expandState = isChild ? this.state.isChildExpand : this.state.isExpand
    const canShowExpand = isChild
      ? this.state.canChildShowExpand
      : this.state.canShowExpand
    if (!canShowExpand) return null
    return (
      <div
        className="tag-choose-expend"
        onClick={() => {
          if (isChild) {
            this.setState({
              isChildExpand: !expandState
            })
          } else {
            this.setState({
              isExpand: !expandState
            })
          }
        }}
      >
        {expandState ? (
          <span>
            收起 <Icon type="caret-up" />
          </span>
        ) : (
          <span>
            展开 <Icon type="caret-down" />
          </span>
        )}
      </div>
    )
  }

  render() {
    const {
      isShowExpand,
      style,
      className,
      isNested,
      isShowUnlimit,
      list = [],
      value
    } = this.props
    const { isExpand, currentCategoryId, isChildExpand } = this.state
    const classNames = classnames('tag-choose', className)
    if (isNested) {
      return (
        <React.Fragment>
          <div className={classNames} style={style}>
            <ul
              className={classnames('tag-choose-content', {
                expanded: isExpand
              })}
              ref={this.listRef}
            >
              {isShowUnlimit && (
                <li
                  onClick={() => this.handleCategoryClick(undefined)}
                  className={classnames('tag-choose-item', {
                    choosen: currentCategoryId === undefined
                  })}
                >
                  不限
                </li>
              )}
              {list.map(item => {
                return (
                  <li
                    key={item.value}
                    className={classnames('tag-choose-item', {
                      choosen: currentCategoryId === item.value
                    })}
                    onClick={() => this.handleCategoryClick(item.value)}
                  >
                    {item.label}
                  </li>
                )
              })}
            </ul>
            {isShowExpand && this.renderExpandIcon()}
          </div>
          <div className={classNames} style={style}>
            <ul
              className={classnames('tag-choose-content', {
                expanded: isChildExpand
              })}
              ref={this.childListRef}
            >
              {this.currentList.map(item => {
                return (
                  <li
                    key={item.value}
                    onClick={() => this.handleTagClick(item.value)}
                    className={classnames('tag-choose-item', {
                      'choosen-child': value && value.indexOf(item.value) !== -1
                    })}
                  >
                    {item.label}
                  </li>
                )
              })}
            </ul>
            {isShowExpand && this.renderExpandIcon(true)}
          </div>
        </React.Fragment>
      )
    } else {
      // 一维的标签列表
      return (
        <div className={classNames} style={style}>
          <ul
            className={classnames('tag-choose-content', { expanded: isExpand })}
            ref={this.listRef}
          >
            {isShowUnlimit && (
              <li
                onClick={() => this.handleTagClick(undefined)}
                className={classnames('tag-choose-item', {
                  choosen: value === undefined
                })}
              >
                不限
              </li>
            )}
            {list.map(item => {
              return (
                <li
                  key={item.value}
                  onClick={() => this.handleTagClick(item.value)}
                  className={classnames('tag-choose-item', {
                    choosen: value === item.value
                  })}
                >
                  {item.label}
                </li>
              )
            })}
          </ul>
          {isShowExpand && this.renderExpandIcon()}
        </div>
      )
    }
  }
}
