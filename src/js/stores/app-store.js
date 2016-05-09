var AppDispatcher = require('../dispatchers/app-dispatcher');
var AppConstants = require('../constants/app-constants');
var assign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;  // from device

var CHANGE_EVENT = "change";

var _softwareRepo = [];
var _currentGroup = [];
var _currentDevices = [];
var _selectedDevices = [];
var _filters = [{key:'', value:''}];
var _attributes = {
  name: "Name",
  model: "Device type",
  arch: "Architecture",
  status: "Status",
  software_version: "Current software",
  tags: "Tags"
}

/* TEMP LOCAL GROUPS */
var _groups1 = [
  {
    id: 1,
    name: "All devices",
    devices: [1,2,3,4,5,6,7],
    type: "public"
  },
  {
    id: 2,
    name: "Development",
    devices: [6],
    type: "public"
  },
  {
    id: 3,
    name: "Test",
    devices: [4,6],
    type: "public"

  },
  {
    id: 4,
    name: "Production",
    devices: [1,2,3],
    type: "public"
  },
]

var _groups = [
  {
    id: 1,
    name: "All devices",
    devices: [],
    type: "public"
  }
]


/* Temp local devices */

var _alldevices = [];

var _alldevices1 = [
  {
    'id': 1,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf1',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.1',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 2,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf2',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.1',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 3,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf3',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.1',
    'groups': [1,4],
    'tags': []
  },
  {
    'id': 4,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf4',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.2',
    'groups': [1,2],
    'tags': []
  },
  {
    'id': 5,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf5',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.2',
    'groups': [1,3],
    'tags': []
  },
  {
    'id': 6,
    'name': '00a0c91e6-7dec-11d0-a765-f81d4faebf6',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Up',
    'software_version': 'Application 0.0.2',
    'groups': [1,3],
    'tags': []
  },
  {
    'id': 7,
    'name': '0dde3346-4dec-11d0-a765-f81d4faebf7',
    'model':"Raspberry Pi 2 Model B",
    'arch': 'ARMv7 Cortex-A7',
    'status': 'Down',
    'software_version': 'Application 0.0.1',
    'groups': [1],
    'tags': []
  },
];

var _unauthorized = [
  {
    'id':8,
    'name': '33vayc91e6-7dec-11d0-a765-f81d4faebf5',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Unauthorized',
    'software_version': 'Application 0.0.2',
    'groups': [],
    'tags': []
  },
  {
    'id':9,
    'name': '4f98de-4apr-11d0-a765-f81d488y4fs',
    'model':"Raspberry Pi 3",
    'arch': 'ARMv8 Cortex-A53',
    'status': 'Unauthorized',
    'software_version': 'Application 0.0.2',
    'groups': [],
    'tags': []
  },
];

_selectGroup(_groups[0].id);

function _selectGroup(id) {
  _selectedDevices = [];
  _filters = [{key:'', value:''}];
  if (id) {
    _currentGroup = _getGroupById(id);
    _getCurrentDevices(_currentGroup.id);
  }
}

function _getGroupById(id) {
  for (var i=0; i<_groups.length;i++) {
    if (_groups[i].id === id) {
      return _groups[i];
    }
  }
  return;
}

function _addNewGroup(group, devices, type) {
  var tmpGroup = group;
  for (var i=0;i<devices.length;i++) {
    tmpGroup.devices.push(devices[i].id);
  }
  tmpGroup.id = _groups.length+1;
  tmpGroup.type = type ? type : 'public';
  _groups.push(tmpGroup);
  _selectGroup(_groups.length);
}

function _getDeviceById(deviceId) {
  for (var i=0; i<_alldevices.length;i++) {
    if (_alldevices[i].id === deviceId) {
      return _alldevices[i];
    }
  }
  return;
}

function _getCurrentDevices(groupId) {
  _currentDevices = [];
  var devicelist = _getGroupById(groupId).devices;
  for (var i=0; i<devicelist.length; i++) {
    var device = _getDeviceById(devicelist[i]);
    if (_matchFilters(device)) {
       _currentDevices.push(device);
    }
  }
}

function  updateDeviceTags(id, tags) {
  var index = findWithAttr(_alldevices, "id", id);
  _alldevices[index].tags = tags;
}

function  updateFilters(filters) {
  _filters = filters;
  _getCurrentDevices(_currentGroup.id);
}

function _matchFilters(device) {
  /*
  * Match device attributes against _filters, return true or false
  */
  var match = true;
  for (var i=0; i<_filters.length; i++) {
    if (_filters[i].key && _filters[i].value) {
      if (device[_filters[i].key] instanceof Array) {
        // array
         if (device[_filters[i].key].join(', ').toLowerCase().indexOf(_filters[i].value.toLowerCase()) == -1) {
          match = false;
        }
      } else {
        // string
        if (device[_filters[i].key].toLowerCase().indexOf(_filters[i].value.toLowerCase()) == -1) {
          match = false;
        }
      }
    }
  }
  return match;
}


function _selectDevices(devicePositions) {
  _selectedDevices = [];
  for (var i=0; i<devicePositions.length; i++) {
   _selectedDevices.push(_currentDevices[devicePositions[i]]);
  }
}

function _getDevices(group, model) {
  // get group id from name

  var index = findWithAttr(_groups, 'name', group);
  var groupId = _groups[index].id;

  var devices = [];
  for (var i=0; i<_alldevices.length; i++) {
    if (_alldevices[i].model===model) {
      for (var x=0; x<_alldevices[i].groups.length;x++) {
        if (_alldevices[i].groups[x]===groupId) {
          devices.push(_alldevices[i]);
        }
      }
    }
  }

  return devices;
}

function _addToGroup(group, devices) {
  var tmpGroup = group;
  var idx = findWithAttr(_groups, 'id', tmpGroup.id);
  if (idx != undefined) {
    for (var i=0; i<devices.length;i++) {
      if (tmpGroup.devices.indexOf(devices[i].id)===-1) {
        tmpGroup.devices.push(devices[i].id);
      }
      else {
        tmpGroup.devices.splice(tmpGroup.devices.indexOf(devices[i].id),1);
      }
    }
    _groups[idx] = tmpGroup;

    // reset filters
    _filters = [{key:'', value:''}];
    _getCurrentDevices(tmpGroup.id);

    // TODO - delete if empty group?

  } else {
    // New group
    _addNewGroup(group, devices, 'public');
    // TODO - go through devices and add group
  }
}

function _removeGroup(groupId) {
  var idx = findWithAttr(_groups, "id", groupId);
  if (_currentGroup.id === groupId) {
    _selectGroup(_groups[0].id);
  }
  _groups.splice(idx, 1);
}

function _addGroup(group, idx) {
  if (idx !== undefined) {
    _groups.splice(idx, 0, group);
  }
}

function _getDeviceHealth() {
  var health = {};
  var down = collectWithAttr(_alldevices, 'status', 'Down');
  health.down = down.length;
  health.up = _alldevices.length - health.down;
  health.total = _alldevices.length;
  return health;
}

function _getUnauthorized() {
  return _unauthorized;
}

function _authorizeDevices(devices) {
  // for each device, get name, make sure none in _alldevices with name, if ok then push to _alldevices

  for (var i=0; i<devices.length; i++) {
    var idx = findWithAttr(_alldevices, 'name', devices[i].name);

    if (idx === undefined) {
      devices[i].groups.push(1);
      devices[i].status = "Up";
      _alldevices.push(devices[i]);
      _groups[0].devices.push(devices[i].id);

      var unIdx = findWithAttr(_unauthorized, 'name', devices[i].name);
      if (unIdx !== undefined) {
        _unauthorized.splice(unIdx, 1);
      }
    } else {
      // id already exists - error
      console.log("device id already exists");
    }
  }
  _selectGroup(_currentGroup.id);
}


function discoverDevices(array) {
  var unique = {};

  for (var i=0; i<_alldevices.length; i++) {
    if (typeof(unique[_alldevices[i].software_version]) == "undefined") {
      unique[_alldevices[i].software_version] = 0;
    }
    unique[_alldevices[i].software_version]++;
  }

  if (array.length) {
    for (var val in unique) {
      var idx = findWithAttr(array, 'name', val);
      if (idx!==undefined) { array[idx]['devices'] = unique[val] }
    }
  }
  return array;
}

function _uploadImage(image) {
  if (image.id) {
    _softwareRepo[findWithAttr(_softwareRepo, "id", image.id)] = image;
  } else {
    image.id = _softwareRepo.length+1;
    _softwareRepo.push(image);
  }
}


// Deployments
var _progress = [];
var _recent = []
var _schedule = [];
var _events = [];

var _allDeployments = [];
var _selectedDeployment = {};

//_al deployments.sort(startTimeSort);


var _activityLog = [
  {
    summary: "User Admin deployed an deployment to all devices",
    details: "6 devices began updating to Application 0.0.2 at 2016-03-24 00:00",
    timestamp: 1458777600000,
    negative: false
  },
  {
    summary: "User Admin uploaded image Application 0.0.2",
    details: "Software image Application 0.0.2 was uploaded at 2016-03-22 15:13",
    timestamp: 1458659590000,
    negative: false
  },
  {
    summary: "User Admin cancelled an deployment to group Test",
    details: "Cancelled deployment to 2 devices in group Test to image Application 0.0.1 at 2016-03-21 09:30",
    timestamp: 1458552600000,
    negative: true
  },
];

function _getRecentDeployments(time) {
  var recent = [];
  for (var i=0;i<_allDeployments.length;i++) {
    var created = new Date(_allDeployments[i].created.replace(/-/g, '/').replace(/ UTC/, ''));
    var finished = new Date(_allDeployments[i].finished.replace(/-/g, '/').replace(/ UTC/, ''));
    if (created<time && finished<time) {
      recent.push(_allDeployments[i]);
    }
  }
  return recent;
}

function _getProgressDeployments(time) {
  var progress = [];
  for (var i=0;i<_allDeployments.length;i++) {
    var created = new Date(_allDeployments[i].created.replace(/-/g, '/').replace(/ UTC/, ''));
    var finished = new Date(_allDeployments[i].finished.replace(/-/g, '/').replace(/ UTC/, ''));
    /*
    * CHANGE FOR MOCKING API
    */ 
    if (created<=time && finished>time) {
      progress.push(_allDeployments[i]);
    }
  }
  return progress;
}

function _getProgressStatus(id) {
  var deployment = _allDeployments[findWithAttr(_allDeployments, "id", id)];
  var progress = {complete:0, failed: 0, pending: 0};
  for (var key in deployment.devices) {
    progress[deployment.devices[key].status.toLowerCase()]++;
  }
  return progress;
}

function _getScheduledDeployments(time) {
  var schedule = [];
  for (var i=0;i<_allDeployments.length;i++) {
    if (_allDeployments[i].start_time>time) {
      schedule.push(_allDeployments[i]);
    }
  }
  schedule.sort(startTimeSortAscend);
  return schedule;
}

function _saveSchedule(schedule, single) {
  var tmp = {};
  tmp.id = schedule.id || _allDeployments.length+1;
  tmp.group = schedule.group.name;
  tmp.model = "Acme Model 1";
  // whether single device or group
  tmp.devices = !single ? _getDevices(tmp.group, tmp.model) : collectWithAttr(_alldevices, 'name', tmp.group);
  tmp.software_version = schedule.image.name;
  tmp.created = schedule.start_time.toString();
  tmp.finished = schedule.end_time.toString();
  var index = findWithAttr(_allDeployments, 'id', tmp.id);
  index != undefined ? _allDeployments[index] = tmp : _allDeployments.push(tmp);
}

function _removeDeployment(id) {
  var idx = findWithAttr(_allDeployments, 'id', id);
  _allDeployments.splice(idx,1);
}


function _sortTable(array, column, direction) {
  switch(array) {
    case "_softwareRepo":
      _softwareRepo.sort(customSort(direction, column));
      break;
    case "_currentDevices":
      _currentDevices.sort(customSort(direction, column));
      break;
    case "_unauthorized":
      _unauthorized.sort(customSort(direction, column));
      break;
  }
}


function findWithAttr(array, attr, value) {
  for(var i = 0; i<array.length; i++) {
    if(array[i][attr] === value) {
      return i;
    }
  }
}

function collectWithAttr(array, attr, value) {
  var newArr = [];
   for(var i = 0; i<array.length; i++) {
    if(array[i][attr].toString() === value.toString()) {
      newArr.push(array[i]);
    }
  }
  return newArr;
}

function customSort(direction, field) {
  return function(a, b) {
    if (a[field] > b[field])
       return direction ? -1 : 1;
    if (a[field] < b[field])
      return direction ? 1 : -1;
    return 0;
  };
}

function statusSort(a,b) {
  return (a.status > b.status) - (a.status < b.status);
}

function startTimeSort(a,b) {
  return (b.start_time > a.start_time) - (b.start_time < a.start_time);
}
function startTimeSortAscend(a,b) {
  return (a.start_time > b.start_time) - (a.start_time < b.start_time);
}



/*
* API STARTS HERE
*/
function setImages(images) {
  if (images) {
     _softwareRepo = images;
  }
  _softwareRepo.sort(customSort(1, "modified"));
}



function setDeployments(deployments) {
  if (deployments) {
     _allDeployments = deployments;
  }
  _allDeployments.sort(startTimeSort);
}

function setSelectedDeployment(deployment) {
  if (deployment) {
    _selectedDeployment = deployment;
  }
}




var AppStore = assign(EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },

  changeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getGroups: function() {
    /*
    * Return list of groups
    */
    return _groups
  },

  getSingleGroup: function(attr, val) {
    return _groups[findWithAttr(_groups, attr, val)];
  },

  getSelectedGroup: function() {
    /*
    * Return group object for current group selection
    */
    return _currentGroup
  },


  getAllDevices: function() {
    /*
    * Return list of devices by current selected group
    */
    return _alldevices
  },

  getDevices: function() {
    /*
    * Return list of devices by current selected group
    */
    return _currentDevices
  },

  getSingleDevice: function(id) {
    /*
    * Return single device by id
    */
    return _alldevices[findWithAttr(_alldevices, 'id', id)]
  },

  getAttributes: function() {
    /*
    * Return set of filters for list of devices
    */
    return _attributes
  },

  getFilters: function() {
    /*
    * Return set of filters for list of devices
    */
    return _filters
  },

  getSelectedDevices: function() {
    /*
    * Return list of selected devices
    */
    return _selectedDevices
  },

  getSoftwareRepo: function() {
    /*
    * Return list of saved software objects
    */
    return discoverDevices(_softwareRepo);
  },

  getSoftwareImage: function(attr, val) {
    /*
    * Return single image by attr
    */
    return _softwareRepo[findWithAttr(_softwareRepo, attr, val)];
  },

  getRecentDeployments: function(date) {
    /*
    * Return list of deployments before date
    */
    return _getRecentDeployments(date)
  },

  getSingleDeployment: function(attr, val) {
    var index = findWithAttr(_allDeployments, attr, val);
    return _allDeployments[index];
  },

  getSelectedDeployment: function() {
    /*
    * Return current selected deployment
    */
    return _selectedDeployment
  },

  getProgressDeployments: function(date) {
    /*
    * Return list of deployments in progress based on date
    */
    return _getProgressDeployments(date)
  },

  getProgressStatus: function(id) {
    /*
    * Return progress stats for a single deployment
    */
    return _getProgressStatus(id);
  },

  getScheduledDeployments: function(date) {
    /*
    * Return list of deployments scheduled after date
    */
    return _getScheduledDeployments(date)
  }, 

  getEventLog: function() {
    /*
    * Return list of event objects from log
    */
    return _events
  },

  getDevicesFromParams: function(group, model) {
    /*
    * Return list of devices given group and model
    */
    return _getDevices(group, model)
  },

  getHealth: function() {
    return _getDeviceHealth()
  },

  getUnauthorized: function() {
    return _getUnauthorized()
  },

  getActivity: function() {
    /*
    * Return activity log
    */
    return _activityLog
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    switch(action.actionType) {
      case AppConstants.SELECT_GROUP:
        _selectGroup(payload.action.groupId);
        break;
      case AppConstants.SELECT_DEVICES:
        _selectDevices(payload.action.devices);
        break;
      case AppConstants.ADD_TO_GROUP:
        _addToGroup(payload.action.group, payload.action.devices);
        break;
      case AppConstants.REMOVE_GROUP:
        _removeGroup(payload.action.groupId);
        break;
      case AppConstants.ADD_GROUP:
        _addGroup(payload.action.group, payload.action.index);
        break;
      case AppConstants.AUTHORIZE_DEVICES:
        _authorizeDevices(payload.action.devices);
        break;
      case AppConstants.UPLOAD_IMAGE:
        _uploadImage(payload.action.image);
        break;
      case AppConstants.SAVE_SCHEDULE:
        _saveSchedule(payload.action.schedule, payload.action.single);
        break;
      case AppConstants.UPDATE_FILTERS:
         updateFilters(payload.action.filters);
        break;
      case AppConstants.UPDATE_DEVICE_TAGS:
         updateDeviceTags(payload.action.id, payload.action.tags);
        break;
      case AppConstants.REMOVE_DEPLOYMENT:
        _removeDeployment(payload.action.id);
        break;
      case AppConstants.SORT_TABLE:
        _sortTable(payload.action.table, payload.action.column, payload.action.direction);
        break;

      /* API */
      case AppConstants.RECEIVE_IMAGES:
        setImages(payload.action.images);
        break;

      /* API */
      case AppConstants.RECEIVE_DEPLOYMENTS:
        setDeployments(payload.action.deployments);
        break;
       case AppConstants.SINGLE_DEPLOYMENT:
        setSelectedDeployment(payload.action.deployment);
        break;
    }
    
    AppStore.emitChange();
    return true;
  })

});

module.exports = AppStore;
