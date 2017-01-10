﻿IoTApp.createModule('IoTApp.ScheduleTwinUpdate', function () {
    'use strict';

    var self = this;
    function PropertiesEditItem(name, value, isDeleted) {
        var self = this;
        self.PropertyName = ko.observable(name);
        self.PropertyValue = ko.observable(value);
        self.isDeleted = ko.observable(isDeleted);
        self.isEmptyValue = ko.computed(function () {
            return self.PropertyValue() == "" || self.PropertyValue() == null;
        })
    }

    function TagsEditItem(name, value, isDeleted) {
        var self = this;
        self.TagName = ko.observable(name);
        self.TagValue = ko.observable(value);
        self.isDeleted = ko.observable(isDeleted);
        self.isEmptyValue = ko.computed(function () {
            return self.TagValue() == "" || self.TagValue() == null;
        })
    }

    function viewModel() {
        var self = this;
        this.backUrl = ko.observable(resources.redirectToDeviceIndexUrl);
        this.jobName = ko.observable("");
        this.properties = ko.observableArray();
        this.tags = ko.observableArray();
        this.startDate = ko.observable(moment());
        this.isPropertiesLoading = true;
        this.isTagsLoading = true;
        this.maxExecutionTime = ko.observable(30);
        this.cachetagList = {};
        this.cachepropertyList = {};
        this.onepropleft = ko.observable(true);
        this.onetagleft = ko.observable(true);
        this.totalFilteredCount = ko.observable();
        this.propertieslist = {};
        this.tagslist = {};
        this.filterId = "";

        this.createEmptyPropertyIfNeeded = function (property) {
            if (self.properties.indexOf(property) == self.properties().length - 1 && !property.isEmptyValue()) {
                self.properties.push(new PropertiesEditItem("", "", false, false))
                self.onepropleft(false);
            }
            return true;
        }

        this.createEmptyTagIfNeeded = function (tag) {
            if (self.tags.indexOf(tag) == self.tags().length - 1 && !tag.isEmptyValue()) {
                self.tags.push(new TagsEditItem("", "", false, false))
                self.onetagleft(false);
            }
            return true
        }

        this.removeTag = function (tag) {
            self.tags.remove(tag);
            if (self.tags().length <= 1) {
                self.onetagleft(true);
            }
        }

        this.backButtonClicked = function () {
            location.href = self.backUrl();
        }

        this.removeProperty = function (prop) {
            self.properties.remove(prop);
            if (self.properties().length <= 1) {
                self.onepropleft(true);
            }
        }

        this.beforePost = function (elem) {
            $(elem).find("#StartDateHidden").val(moment(this.startDate()).utc().format());
            return true;
        }

        this.maketaglist = function (elem, index, data) {
            self.refreshnamecontrol();
        }

        this.makeproplist = function (elem, index, data) {
            self.refreshnamecontrol();
        }

        this.cachepropertyList = function (namelist) {
            self.propertieslist = namelist;
            self.refreshnamecontrol();
        }

        this.cachetagList = function (namelist) {
            self.tagslist = namelist;
            self.refreshnamecontrol();
        }

        this.getTotalFilterdCount = ko.pureComputed(function () {
            if (self.totalFilteredCount()) {
                return resources.TotalDeviceString.replace(/\{0\}/, self.totalFilteredCount());
            }
            else {
                return resources.TotalDeviceString.replace(/\{0\}/, resources.LoadingText);
            }
        }, this);

        this.refreshnamecontrol = function () {
            jQuery('.edit_form__texthalf.edit_form__propertiesComboBox').each(function () {
                IoTApp.Controls.NameSelector.create(jQuery(this), { type: IoTApp.Controls.NameSelector.NameListType.desiredProperty }, self.propertieslist);
            });
            jQuery('.edit_form__texthalf.edit_form__tagsComboBox').each(function () {
                IoTApp.Controls.NameSelector.create(jQuery(this), { type: IoTApp.Controls.NameSelector.NameListType.tag }, self.tagslist);
            });
        }

        this.init = function (data) {
            if (data) {
                self.filterId = data.FilterId;
                self.jobName(data.JobName);
                if (resources.originalJobId) {
                    self.backUrl(resources.redirectToJobIndexUrl + "?jobId=" + resources.originalJobId);
                    self.jobName(data.JobName);
                } else {
                    self.backUrl(resources.redirectToDeviceIndexUrl + "?filterId=" + self.filterId);
                }
                self.maxExecutionTime(data.MaxExecutionTimeInMinutes);

                if (!data.DesiredProperties || data.DesiredProperties.length == 0) {
                    self.properties.push(new PropertiesEditItem("", "", false));
                } else {
                    self.properties($.map(data.DesiredProperties, function (p) {
                        return new PropertiesEditItem(p.PropertyName, p.PropertyValue, false);
                    }));
                }

                if (!data.Tags || data.Tags.length == 0) {
                    self.tags.push(new TagsEditItem("", "", false));
                } else {
                    self.tags($.map(data.Tags, function (t) {
                        return new TagsEditItem(t.TagName, t.TagValue, false);
                    }));
                }

                $.ajax({
                    url: '/api/v1/devices/count/' + self.filterId,
                    type: 'GET',
                    cache: false,
                    success: function (result) {
                        self.totalFilteredCount(result.data);
                    },
                    error: function (xhr, status, error) {
                        IoTApp.Helpers.Dialog.displayError(resources.failedToGetDeviceCount);
                    }
                });
            }
            else {
                self.properties.push(new PropertiesEditItem("", "", false));
                self.tags.push(new TagsEditItem("", "", false));
            }

            IoTApp.Controls.NameSelector.loadNameList({ type: IoTApp.Controls.NameSelector.NameListType.tag }, self.cachetagList);
            IoTApp.Controls.NameSelector.loadNameList({ type: IoTApp.Controls.NameSelector.NameListType.desiredProperty }, self.cachepropertyList);

        }
    }

    var vm = new viewModel();
    return {
        init: function (data) {
            vm.init(data);
            ko.applyBindings(vm);
        }
    }

}, [jQuery, resources]);