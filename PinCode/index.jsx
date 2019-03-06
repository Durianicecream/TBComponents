/*
 * @Author: TB
 * @Date: 2018-10-25 12:20:24
 * @Last Modified by: TB
 * @Last Modified time: 2019-03-06 13:32:15
 * 手机验证码输入组件
 */

import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

import "./index.less";

export default class PinCode extends React.Component {
  static propTypes = {
    onFinish: PropTypes.func, // 输入完成回调
    className: PropTypes.string,
    length: PropTypes.number //　验证码长度
  };

  static defaultProps = {
    onFinish: () => {},
    className: "",
    length: 6
  };

  constructor() {
    super();
    this.state = {
      pinCode: "",
      cursor: 0
    };
  }

  handleFocus = () => {
    this[`input_${this.state.cursor}`].focus();
  };

  handleKeyDown = e => {
    let pinCode, cursor;
    if (e.key === "Backspace") {
      // 如果是删除 游标向左移动
      cursor = index - 1 >= 0 ? index - 1 : 0;
      pinCode = this.state.pinCode.slice(0, this.state.pinCode.length - 1);
    } else if (/[0-9]/.test(e.key)) {
      // 如果输入了数字
      pinCode = this.state.pinCode + e.key;
      cursor = index + 1;
      if (cursor >= this.props.length) {
        // 输入完成 调用父组件finish方法 并重置pincode
        this.props.onFinish(pinCode);
        cursor = 0;
        pinCode = "";
      }
    } else {
      // 如果都不是 则什么都不干
      return;
    }
    this.setState({ cursor, pinCode }, this.handleFocus);
  };

  render() {
    const classes = classnames("fc-pincode", this.props.className);
    return (
      <div className={classes}>
        {Array(this.props.length)
          .fill("")
          .map((item, index) => {
            return (
              <input
                key={index}
                type="text"
                pattern="[0-9]*"
                maxLength={1}
                value={this.state.pinCode[index] || ""}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleFocus}
                ref={input => (this[`input_${index}`] = input)}
              />
            );
          })}
      </div>
    );
  }
}
