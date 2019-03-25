/*
 * @Author: TB
 * @Date: 2019-03-25 13:26:58
 * @Last Modified by: TB
 * @Last Modified time: 2019-03-25 13:27:22
 * 阿里云OSS 上传组件,可以显示上传进度
 */
import React from "react";
import { Upload, message, Icon, Progress } from "antd";
import PropTypes from "prop-types";
import Crypto from "crypto";
import { fetchJSON } from "services/ajax";

export default class FileUpload extends React.Component {
  static propTypes = {
    value: PropTypes.shape({
      url: PropTypes.string,
      size: PropTypes.number
    }),
    title: PropTypes.string,
    onChange: PropTypes.func
  };
  static defaultProps = {
    title: "点击此处上传文件",
    onChange: () => {}
  };
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      uploadStatus: "init",
      uploadData: {
        success_action_status: 200,
        policy: new Buffer(
          JSON.stringify({
            expiration: "2020-01-01T12:00:00.000Z",
            conditions: [{ bucket: "xxx" }]
          })
        ).toString("base64")
      }, //填写你的bucket
      uploadPath: "",
      uploadHost: "https://output-mingbo.oss-cn-beijing.aliyuncs.com/",
      uploadName: "file",
      STS: null,
      isInit: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.isInit) {
      return null;
    }
    if (nextProps.value && nextProps.value.url) {
      return {
        uploadStatus: "done",
        isInit: true
      };
    }
    return null;
  }

  /**
   * 获取临时STS凭证
   */
  fetchSignature = () => {
    if (this.state.STS) {
      return Promise.resolve();
    } else {
      const localSTS = this.getLocalSTS();
      if (localSTS) {
        this.setState({ STS: localSTS });
        return Promise.resolve();
      } else {
        const url = "/api/upload/osstoken";
        return fetchJSON(url, {}, "POST").then(res => {
          const STS = {
            Signature: this.signature(
              this.state.uploadData.policy,
              res.data.accesskeysecret
            ),
            OSSAccessKeyId: res.data.accesskeyid,
            "x-oss-security-token": res.data.securitytoken
          };
          this.setLocalSTS(STS);
          this.setState({ STS });
          return true;
        });
      }
    }
  };

  getLocalSTS = () => {
    const STSInfo = JSON.parse(sessionStorage.getItem("STS"));
    if (!STSInfo || !STSInfo.expires) return null;
    if (new Date(STSInfo.expires) < new Date()) return null;
    delete STSInfo.expires;
    return STSInfo;
  };

  setLocalSTS = data => {
    data.expires = new Date(new Date().getTime() + 10 * 60 * 1000);
    sessionStorage.setItem("STS", JSON.stringify(data));
  };

  /**
   * 生成上传签名
   * @param {string} policyText
   * @param {string} accesskey
   * @return siginature
   */
  signature = (policyText, accesskey) => {
    const signature = Crypto.Hmac("sha1", accesskey)
      .update(policyText)
      .digest("base64");
    return signature;
  };

  /**
   * 生成MD5签名
   * @param {File} file 文件
   * @return hex 签名
   */
  md5 = file => {
    const hash = Crypto.Hash("md5");
    const chunkSize = 2 * 1024 * 1024;
    const chunkLen = Math.ceil(file.size / chunkSize);
    const blobSlice =
      File.prototype.mozSlice ||
      File.prototype.webkitSlice ||
      File.prototype.slice;
    const fileReader = new FileReader();
    let bs = fileReader.readAsBinaryString;
    let currentChunk = 0;

    const loadNext = chunkSize => {
      let start = currentChunk * chunkSize;
      let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      if (bs) fileReader.readAsBinaryString(blobSlice.call(file, start, end));
      else fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    };

    return new Promise((resolve, reject) => {
      try {
        loadNext(chunkSize);
      } catch (err) {
        reject(err);
      }

      // 文件读取完毕之后的处理
      fileReader.onload = e => {
        try {
          hash.update(e.target.result);
          currentChunk += 1;
          this.setState({
            progressPercent: Math.ceil((10 * currentChunk) / chunkLen, 10)
          });
          if (currentChunk < chunkLen) {
            loadNext();
          } else {
            resolve(hash.digest("hex"));
          }
        } catch (err) {
          reject(err);
        }
      };
    });
  };

  /**
   * 获取文件后缀名
   * @param {string} name 文件名
   * @return {string} 文件后缀名
   */
  suffix = file_name => {
    const index = file_name.lastIndexOf(".");
    const strtype = file_name.substr(index + 1, file_name.length);
    return strtype.toLowerCase();
  };

  beforeUpload = file => {
    // 获取临时凭证
    return this.fetchSignature()
      .then(() => {
        // 生成文件MD5
        this.setState({ status: "uploading" });
        return this.md5(file);
      })
      .then(md5 => {
        return this.setState({
          uploadPath: `upload/${md5}.${this.suffix(file.name)}`
        });
      });
  };

  handleFileChange = event => {
    const status = event.file.status;
    this.setState({ uploadStatus: status });
    if (status === "error") {
      message.error("服务器处理异常");
    } else if (status === "done") {
      message.success("上传成功");
      this.setState({
        progressPercent: 100
      });
      const url = `${this.state.uploadHost}/${this.state.uploadPath}`;
      this.props.onChange({ url, size: event.file.size });
    } else if (status === "uploading") {
      this.setState({
        progressPercent: Math.floor(event.file.percent * 0.9 + 10)
      });
    }
  };

  renderFileImage = () => {
    if (this.state.uploadStatus === "uploading") {
      return (
        <Progress
          type="circle"
          percent={this.state.progressPercent}
          width={100}
        />
      );
    } else if (this.state.uploadStatus === "init") {
      return (
        <React.Fragment>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">{this.props.title}</p>
        </React.Fragment>
      );
    } else if (this.state.uploadStatus === "done") {
      return (
        <React.Fragment>
          <p className="ant-upload-drag-icon">
            <Icon type="file" />
          </p>
          <p className="ant-upload-text">重新上传</p>
        </React.Fragment>
      );
    } else if (this.state.uploadStatus === "error") {
      return (
        <Progress
          type="circle"
          status="exception"
          width={100}
          percent={this.state.progressPercent}
        />
      );
    }
  };

  render() {
    return (
      <div style={{ marginTop: 16, height: 180 }}>
        <Upload.Dragger
          beforeUpload={this.beforeUpload}
          onChange={this.handleFileChange}
          name={this.state.uploadName}
          action={this.state.uploadHost}
          data={{
            ...this.state.uploadData,
            ...this.state.STS,
            key: this.state.uploadPath
          }}
          showUploadList={false}
        >
          {this.renderFileImage()}
        </Upload.Dragger>
      </div>
    );
  }
}

// import AliyunOSS from './aliyun-oss-sdk-5.2.0.min.js'
// import AliyunUpload from './aliyun-upload-sdk-1.4.0.min.js'

// 	/**
// 	 * 初始化上传SDK
// 	 */

// 	beforeUpload = (file) => {
// 		if (!this.validateFile(file)) return

// 		this.file = file
// 		this.fetchSignature()
// 			.then(() => {
// 				const uploader = this.initAliUploader()
// 				uploader.addFile(file)
// 				uploader.startUpload()
// 			})
// 			.catch((err) => {
// 				console.log(err)
// 				Toast.error('服务器处理异常')
// 			})
// 	}

//          /**
// 	 * 初始化上传SDK
// 	 */
// 	initAliUploader = () => {
// 		const uploader = new window.AliyunUpload.Vod({
// 			//分片大小默认1M，不能小于100K
// 			partSize: 1048576,
// 			//并行上传分片个数，默认5
// 			parallel: 5,
// 			//网络原因失败时，重新上传次数，默认为3
// 			retryCount: 3,
// 			//网络原因失败时，重新上传间隔时间，默认为2秒
// 			retryDuration: 2,
// 			// 开始上传
// 			onUploadstarted: (uploadInfo) => {
// 				uploader.setUploadAuthAndAddress(
// 					uploadInfo,
// 					this.STS.uploadAuth,
// 					this.STS.uploadAddress,
// 					this.STS.videoId
// 				)
// 				this.setState({
// 					status: 'uploading'
// 				})
// 			},
// 			// 文件上传成功
// 			onUploadSucceed: (uploadInfo) => {
// 				Toast.success('上传成功')
// 				this.setState({ status: 'done', progress: 1 })
// 				this.props.onChange(this.STS.videoId, this.file)
// 			},
// 			// 文件上传失败
// 			onUploadFailed: (uploadInfo, code, message) => {
// 				console.log(code, message)
// 				Toast.error('服务器处理异常')
// 				this.setState({ status: 'error' })
// 			},
// 			// 文件上传进度，单位：字节
// 			onUploadProgress: (uploadInfo, totalSize, loadedPercent) => {
// 				this.setState({ progress: loadedPercent })
// 			}
// 		})
// 		return uploader
// 	}
