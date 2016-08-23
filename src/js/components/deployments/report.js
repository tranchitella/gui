import React from 'react';
import { Link } from 'react-router';
var Time = require('react-time');
var AppActions = require('../../actions/app-actions');
var pluralize = require('pluralize')

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;
var List = mui.List;
var ListItem = mui.ListItem;
var Divider = mui.Divider;
var FontIcon = mui.FontIcon;
var Checkbox = mui.Checkbox;

var Report = React.createClass({
  getInitialState: function() {
    return {
      failsOnly: false,
      stats: {
        failure: null
      }
    };
  },
  componentDidMount: function() {
    AppActions.getSingleDeploymentStats(this.props.deployment.id, function(stats) {
      this._deploymentState("stats",stats);
    }.bind(this));
    AppActions.getSingleDeploymentDevices(this.props.deployment.id, function(devices) {
      this._deploymentState("devices",devices);
    }.bind(this));
  },
  _deploymentState: function (key, val) {
    var state = {};
    state[key] = val;
    this.setState(state);
  },
  _getDeviceDetails: function (id) {
    // get device details not listed in schedule data
    //return AppActions.getSingleDeviceReport(id)
  },
  _handleCheckbox: function (e, checked) {
    this.setState({failsOnly:checked});
  },
  _retryDeployment: function () {
    // replace contents of dialog, also change size, return contents and size on 'cancel'?
    this.props.retryDeployment(this.props.deployment);
  },
  _formatTime: function (date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  exportLog: function (id) {
    AppActions.getDeviceLog(this.props.deployment.id, id, function(data) {
      var content = data;
      var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
      var newWindow = window.open(uriContent, 'deviceLog');
    });
  },
  render: function () {
    var deviceList = [];
    var encodedSoftware = encodeURIComponent(this.props.deployment.artifact_name); 
    var softwareLink = (
      <Link style={{fontWeight:"500"}} to={`/software/${encodedSoftware}`}>{this.props.deployment.artifact_name}</Link>
    )

    if (this.state.devices) {
      deviceList = this.state.devices.map(function(device, index) {
        var encodedDevice = encodeURIComponent("name="+device.id); 
        var deviceLink = (
        <div>
          <Link style={{fontWeight:"500"}} to={`/devices/0/${encodedDevice}`}>{device.id}</Link>
        </div>
        );
        //var deviceDetails = this._getDeviceDetails(device.id);
        if ((device.status==="Failed")||(this.state.failsOnly===false)){
          return (
            <TableRow key={index}>
              <TableRowColumn>{deviceLink}</TableRowColumn>
              <TableRowColumn>{device.device_type}</TableRowColumn>
              <TableRowColumn>{softwareLink}</TableRowColumn>
              <TableRowColumn><Time value={this._formatTime(device.created)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
              <TableRowColumn><Time value={this._formatTime(device.finished)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
              <TableRowColumn>{device.status || "--"}</TableRowColumn>
              <TableRowColumn><FlatButton onClick={this.exportLog.bind(null, device.id)} label="Export log" /></TableRowColumn>
            </TableRow>
          )
        }
      }, this);
    }
    var status = (this.props.deployment.status === "inprogress") ? "In progress" : this.props.deployment.status;
    return (
      <div>
   

        <div className="report-container">
          <div className="deploymentInfo" style={{width:"260", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
           <div><div className="progressLabel">Updating to:</div><span>{softwareLink}</span></div>
           <div><div className="progressLabel">Device group:</div><span>{this.props.deployment.name}</span></div>
           <div><div className="progressLabel"># devices:</div><span>{deviceList.length}</span></div>
          </div>

          <div className="deploymentInfo" style={{width:"260", height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
           <div><div className="progressLabel">Status:</div>Completed<span className={this.state.stats.failure ? "failures" : "hidden"}> with failures</span></div>
           <div><div className="progressLabel">Started:</div><Time value={this._formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
       
          </div>

          <div className="deploymentInfo" style={{height:"auto", margin:"30px 30px 30px 0", display:"inline-block", verticalAlign:"top"}}>
            <div className={this.state.stats.failure ? "statusLarge" : "hidden"}>
              <img src="assets/img/largeFail.png" />
              <div className="statusWrapper">
                <b className="red">{this.state.stats.failure}</b> {pluralize("devices", this.state.stats.failure)} failed to update
              </div>
            </div> 
            <div className={this.state.stats.success ? "statusLarge" : "hidden"}>
            <img src="assets/img/largeSuccess.png" />
              <div className="statusWrapper">
                <b className="green"><span className={this.state.stats.success === deviceList.length ? null : "hidden"}>All </span>{this.state.stats.success}</b> {pluralize("devices", this.state.stats.success)} updated successfully
              </div>
            </div>
            
          </div>
        </div>


        <div className={this.props.deployment.status==='Complete' ? "hidden" : null} style={{display:"inline-block", width:"200px"}}>
          <Checkbox
            label="Show only failures"
            defaultChecked={this.state.stats.failure > 0}
            checked={this.state.failsOnly}
            onCheck={this._handleCheckbox}
            className={this.state.stats.failure ? null : "hidden"} />
        </div>



        <div style={{minHeight:"20vh"}}>

          <Table
            className={deviceList.length ? null : "hidden"}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Device name">Device name</TableHeaderColumn>
                <TableHeaderColumn tooltip="Device type">Device type</TableHeaderColumn>
                <TableHeaderColumn tooltip="Current software">Current software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Deployment start time">Start time</TableHeaderColumn>
                <TableHeaderColumn tooltip="Deployment end time">End time</TableHeaderColumn>
                <TableHeaderColumn tooltip="Deployment status">Deployment status</TableHeaderColumn>
                <TableHeaderColumn tooltip=""></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}>
              {deviceList}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
});

module.exports = Report;