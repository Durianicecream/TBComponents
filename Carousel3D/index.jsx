/*
 * @Author: TB
 * @Date: 2019-03-06 13:29:06
 * @Last Modified by: TB
 * @Last Modified time: 2019-03-08 13:24:43
 * 3D效果的轮播图组件
 */
import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Icon from "components/Icon";
import { debounce } from "lodash";
import "./index.less";

export default class Carousel extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired, // 轮播图
		autoplay: PropTypes.bool //自动播放
  };

	static defaultProps = {
		autoplay: false,
	};

  constructor() {
    super();
    this.state = {
      index: 0,
      animating: false
    };
  }

  initCarousel = element => {
    if (!element) return;
    this.carousel = element;
  };

  get containerWidth() {
    if (!this.carousel) return 940;
    return this.carousel.getBoundingClientRect().width;
  }

  get containerHieght() {
    return this.containerWidth * 0.4;
  }

  get next() {
    const children = this.props.children;
    if (!children && children.length <= 1) {
      return 0;
    } else if (this.state.index === children.length - 1) {
      return 0;
    } else {
      return this.state.index + 1;
    }
  }

  get prev() {
    const children = this.props.children;
    if (!children && children.length <= 1) {
      return 0;
    } else if (this.state.index === 0) {
      return children.length - 1;
    } else {
      return this.state.index - 1;
    }
  }

  getCarouselStyle = index => {
    if (index === this.state.index) {
      return {
        transform: `translateZ(${this.containerWidth / 2}px)`,
        zIndex: 2
      };
    } else if (index === this.next) {
      return {
        transform: `rotateY(90deg) translateZ(${this.containerWidth / 2}px)`,
        opacity: 0.3
      };
    } else if (index === this.prev) {
      return {
        transform: `rotateY(-90deg) translateZ(${this.containerWidth / 2}px)`,
        opacity: 0.3
      };
    } else {
      return {
        display: "none"
      };
    }
  };

  goTo = index => {
    if (this.state.animating) {
      return;
    }
    this.setState({
      index,
      animating: true
    });
    this.timmer = setTimeout(() => {
      this.setState({ animating: false });
      this.timmer = null;
    }, 800);
  };

  handleTouchStart = e => {
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchTiggered = false;
  };

  handleTouchMove = e => {
    if (this.timmer || this.touchTiggered) {
      return;
    }
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const offsetX = touchX - this.touchX;
    if (offsetX >= 52) {
      // 左滑动
      this.goTo(this.prev);
      this.touchTiggered = true;
    } else if (offsetX <= -52) {
      // 右滑动
      this.goTo(this.next);
      this.touchTiggered = true;
    }
  };

  rerender = debounce(() => {
    this.forceUpdate();
  }, 500);

  componentDidMount() {
    window.addEventListener("resize", this.rerender);
    if (this.props.autoplay) {
      this.interval = setInterval(() => {
        this.goTo(this.next);
      }, 5000);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timmer);
    clearInterval(this.interval);
    window.removeEventListener("resize", this.rerender);
  }

  render() {
    const { className, children, autoplay, ...otherProps } = this.props;
    const classes = classnames("fc-carousel-3d", className);
    if (!children) {
      return;
    }
    if (!children.length) {
      return <div className={classes}>{children}</div>;
    } else {
      return (
        <div
          className={classes}
          {...otherProps}
          ref={this.initCarousel}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
        >
          <div className="container">
            {children.map((item, index) => (
              <div
                className="carousel_item"
                key={index}
                style={this.getCarouselStyle(index)}
              >
                {item}
              </div>
            ))}
            <div className="slick-prev" onClick={() => this.goTo(this.prev)}>
              <Icon name="arrow-left" />
            </div>
            <div className="slick-next" onClick={() => this.goTo(this.next)}>
              <Icon name="arrow-right" />
            </div>
          </div>
        </div>
      );
    }
  }
}
