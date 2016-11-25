﻿using GlobalResources;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.Azure.Devices.Applications.RemoteMonitoring.DeviceAdmin.Web.Models
{
    public class DesiredPropetiesEditViewModel
    {
        public string PropertyName { get; set; }   
        public string PropertyValue { get; set; }
        public string Valuetype { get; set; }
        public bool isDeleted { get; set; }

    }

    public class TagsEditViewModel
    {
        public string TagName { get; set; }
        public string TagValue { get; set; }
        public string Valuetype { get; set; }
        public bool isDeleted { get; set; }
    }

    public class ScheduleTwinUpdateModel: ScheduleJobViewModel
    {
        public List<DesiredPropetiesEditViewModel> DesiredProperties { get; set; }

        public List<TagsEditViewModel> Tags { get; set; }
    }
}