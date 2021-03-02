/*
@license
dhtmlxScheduler v.4.4.9 Professional

This software is covered by DHTMLX Commercial License. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
!function(){scheduler._inited_multisection_copies||(scheduler.attachEvent("onEventIdChange",function(e,t){var r=this._multisection_copies;if(r&&r[e]&&!r[t]){var a=r[e];delete r[e],r[t]=a}}),scheduler._inited_multisection_copies=!0),scheduler._register_copies_array=function(e){for(var t=0;t<e.length;t++)this._register_copy(e[t])},scheduler._register_copy=function(e){this._multisection_copies[e.id]||(this._multisection_copies[e.id]={});var t=e[this._get_section_property()],r=this._multisection_copies[e.id];
r[t]||(r[t]=e)},scheduler._get_copied_event=function(e,t){if(!this._multisection_copies[e])return null;if(this._multisection_copies[e][t])return this._multisection_copies[e][t];var r=this._multisection_copies[e];if(scheduler._drag_event&&scheduler._drag_event._orig_section&&r[scheduler._drag_event._orig_section])return r[scheduler._drag_event._orig_section];var a=1/0,i=null;for(var s in r)r[s]._sorder<a&&(i=r[s],a=r[s]._sorder);return i},scheduler._clear_copied_events=function(){this._multisection_copies={};
},scheduler._restore_render_flags=function(e){for(var t=this._get_section_property(),r=0;r<e.length;r++){var a=e[r],i=scheduler._get_copied_event(a.id,a[t]);if(i)for(var s in i)0===s.indexOf("_")&&(a[s]=i[s])}};var e=scheduler.createTimelineView;scheduler.createTimelineView=function(t){function r(){var e=new Date(scheduler.getState().date),r=scheduler.date[h+"_start"](e);r=scheduler.date.date_part(r);var a=[],i=scheduler.matrix[h];i.y_unit=a,i.order={};for(var s=0;s<t.days;s++)a.push({key:+r,label:r
}),i.order[i.y_unit[s].key]=s,r=scheduler.date.add(r,1,"day")}function a(e){var t={};for(var r in e)t[r]=e[r];return t}function i(e,t){t.setDate(1),t.setFullYear(e.getFullYear()),t.setMonth(e.getMonth()),t.setDate(e.getDate())}function s(e){for(var t=[],r=0;r<e.length;r++){var a=d(e[r]);if(scheduler.isOneDayEvent(a))l(a),t.push(a);else{for(var i=new Date(Math.min(+a.end_date,+scheduler._max_date)),s=new Date(Math.max(+a.start_date,+scheduler._min_date)),o=[];+i>+s;){var h=d(a);h.start_date=s,h.end_date=new Date(Math.min(+_(h.start_date),+i)),
s=_(s),l(h),t.push(h),o.push(h)}n(o,a)}}return t}function n(e,t){for(var r=!1,a=!1,i=0,s=e.length;s>i;i++){var n=e[i];r=+n._w_start_date==+t.start_date,a=+n._w_end_date==+t.end_date,n._no_resize_start=n._no_resize_end=!0,r&&(n._no_resize_start=!1),a&&(n._no_resize_end=!1)}}function d(e){var t=scheduler.getEvent(e.event_pid);return t&&t.isPrototypeOf(e)?(e=scheduler._copy_event(e),delete e.event_length,delete e.event_pid,delete e.rec_pattern,delete e.rec_type):e=scheduler._lame_clone(e),e}function l(e){
if(!e._w_start_date||!e._w_end_date){var t=scheduler.date,r=e._w_start_date=new Date(e.start_date),a=e._w_end_date=new Date(e.end_date);e[c]=+t.date_part(e.start_date),e._count||(e._count=1),e._sorder||(e._sorder=0);var i=a-r;e.start_date=new Date(scheduler._min_date),o(r,e.start_date),e.end_date=new Date(+e.start_date+i)}}function o(e,t){t.setMinutes(e.getMinutes()),t.setHours(e.getHours())}function _(e){var t=scheduler.date.add(e,1,"day");return t=scheduler.date.date_part(t)}if("days"!=t.render)return void e.apply(this,arguments);
var h=t.name,c=t.y_property="timeline-week"+h;t.y_unit=[],t.render="bar",t.days=t.days||7,e.call(this,t),scheduler.templates[h+"_scalex_class"]=function(){},scheduler.templates[h+"_scaley_class"]=function(){},scheduler.templates[h+"_scale_label"]=function(e,t,r){return scheduler.templates.day_date(t)},scheduler.date[h+"_start"]=function(e){return e=scheduler.date.week_start(e),e=scheduler.date.add(e,t.x_step*t.x_start,t.x_unit)},scheduler.date["add_"+h]=function(e,r){return scheduler.date.add(e,r*t.days,"day");
};var u=scheduler._renderMatrix;scheduler._renderMatrix=function(e,t){e&&r(),u.apply(this,arguments)};var g=scheduler.checkCollision;scheduler.checkCollision=function(e){if(e[c]){var e=a(e);delete e[c]}return g.apply(scheduler,[e])},scheduler.attachEvent("onBeforeDrag",function(e,t,r){var a=r.target||r.srcElement,i=scheduler._getClassName(a);if("resize"==t)i.indexOf("dhx_event_resize_end")<0?scheduler._w_line_drag_from_start=!0:scheduler._w_line_drag_from_start=!1;else if("move"==t&&i.indexOf("no_drag_move")>=0)return!1;
return!0});var f=scheduler["mouse_"+h];scheduler["mouse_"+h]=function(e){var t;if(this._drag_event&&(t=this._drag_event._move_delta),void 0===t&&"move"==scheduler._drag_mode){var r=scheduler.matrix[this._mode],a={y:e.y};scheduler._resolve_timeline_section(r,a);var i=e.x-r.dx,s=new Date(a.section);o(scheduler._timeline_drag_date(r,i),s);var n=scheduler._drag_event,d=this.getEvent(this._drag_id);n._move_delta=(d.start_date-s)/6e4,this.config.preserve_length&&e._ignores&&(n._move_delta=this._get_real_event_length(d.start_date,s,r),
n._event_length=this._get_real_event_length(d.start_date,d.end_date,r))}var e=f.apply(scheduler,arguments);if(scheduler._drag_mode&&"move"!=scheduler._drag_mode){var l=null;l=scheduler._drag_event&&scheduler._drag_event["timeline-week"+h]?new Date(scheduler._drag_event["timeline-week"+h]):new Date(e.section),e.y+=Math.round((l-scheduler.date.date_part(new Date(scheduler._min_date)))/(6e4*this.config.time_step)),"resize"==scheduler._drag_mode&&(e.resize_from_start=scheduler._w_line_drag_from_start);
}else if(scheduler._drag_event){var _=Math.floor(Math.abs(e.y/(1440/scheduler.config.time_step)));_*=e.y>0?1:-1,e.y=e.y%(1440/scheduler.config.time_step);var c=scheduler.date.date_part(new Date(scheduler._min_date));c.valueOf()!=new Date(e.section).valueOf()&&(e.x=Math.floor((e.section-c)/864e5),e.x+=_)}return e},scheduler.attachEvent("onEventCreated",function(e,t){return scheduler._events[e]&&delete scheduler._events[e][c],!0}),scheduler.attachEvent("onBeforeEventChanged",function(e,t,r,a){return scheduler._events[e.id]&&delete scheduler._events[e.id][c],
!0});var v=scheduler.render_view_data;scheduler.render_view_data=function(e,t){return this._mode==h&&e&&(e=s(e),scheduler._restore_render_flags(e)),v.apply(scheduler,[e,t])};var m=scheduler.get_visible_events;scheduler.get_visible_events=function(){if(this._mode==h){this._clear_copied_events(),scheduler._max_date=scheduler.date.date_part(scheduler.date.add(scheduler._min_date,t.days,"day"));var e=m.apply(scheduler,arguments);return e=s(e),scheduler._register_copies_array(e),e}return m.apply(scheduler,arguments);
};var p=scheduler.addEventNow;scheduler.addEventNow=function(e){if(scheduler.getState().mode==h)if(e[c]){var t=new Date(e[c]);i(t,e.start_date),i(t,e.end_date)}else{var r=new Date(e.start_date);e[c]=+scheduler.date.date_part(r)}return p.apply(scheduler,arguments)};var x=scheduler._render_marked_timespan;scheduler._render_marked_timespan=function(){return scheduler._mode!=h?x.apply(this,arguments):void 0}}}();
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_daytimeline.js.map