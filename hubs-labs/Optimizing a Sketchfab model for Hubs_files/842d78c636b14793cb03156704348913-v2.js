(self.webpackChunksketchfab=self.webpackChunksketchfab||[]).push([[325],{"1dkX":(t,e,i)=>{"use strict";i.d(e,{Z:()=>l});var s=i("Iao2"),n=i("R4My"),o=i.n(n),r=i("Hjnd"),a=i.n(r),c=i("k46e"),d=i("Wuy/");const l=s.Z.extend({el:['<div class="widget slider-widget">','          <div class="widget-wrapper">','              <div class="bar">','                  <div class="slide">','                      <div class="cursor"></div>',"                  </div>","              </div>","          </div>","      </div>"].join(""),events:(0,c.Z)({},s.Z.prototype.events,{"mousedown .bar":"trackDrag","mousedown .cursor":"cursorDrag","touchstart .bar":"trackDrag","touchstart .cursor":"cursorDrag"}),constructor:function(t,e){e=(0,d.Z)(e||{},{model:new(o().Model),name:"value",minimum:0,maximum:1,step:.01,orientation:"horizontal"}),s.Z.prototype.constructor.call(this,t,e),void 0===this.get()&&this.set(0)},initialize:function(){this.$slide=this.$(".slide"),"vertical"===this.options.orientation&&this.$el.addClass("--vertical"),this.started=!1,this.render()},delegateEvents:function(){s.Z.prototype.delegateEvents.apply(this,arguments),a()(window).on("mousemove.delegateEvents"+this.cid,this.moveEvent.bind(this)),a()(window).on("mouseup.delegateEvents"+this.cid,this.stopEvent.bind(this)),a()(window).on("touchmove.delegateEvents"+this.cid,this.moveEvent.bind(this)),a()(window).on("touchend.delegateEvents"+this.cid,this.stopEvent.bind(this))},undelegateEvents:function(){s.Z.prototype.undelegateEvents.apply(this,arguments),a()(window).off(".delegateEvents"+this.cid)},render:function(){var t=this.options.maximum-this.options.minimum,e=100*Math.min((this.get()-this.options.minimum)/t,1),i={};"vertical"===this.options.orientation?i.height=e+"%":i.width=e+"%",this.$slide.css(i)},startEvent:function(t){t.preventDefault(),this.$el.addClass("fast"),this.started=!0},stopEvent:function(t){this.started&&(t.preventDefault(),this.$el.removeClass("fast"),this.started=!1)},moveEvent:function(t){this.started&&(t.preventDefault(),this.selectEvent(t))},selectEvent:function(t){var e,i;if(t.preventDefault(),"horizontal"===this.options.orientation){var s=this.$el.offset().left,n=this.$el.width();void 0===(i=t.pageX)&&(i=t.originalEvent.touches[0].pageX),e=(i-s)/n}else if("vertical"===this.options.orientation){var o=this.$el.offset().top,r=this.$el.height();(i=t.pageY)||(i=t.originalEvent.touches[0].pageY),e=(o+r-i)/r}e=Math.min(Math.max(0,e),1),e=this.options.minimum+e*(this.options.maximum-this.options.minimum),this.change(e)},cursorDrag:function(t){this.startEvent(t),t.stopPropagation()},trackDrag:function(t){this.startEvent(t),this.moveEvent(t)}})},yCZG:(t,e,i)=>{"use strict";i.d(e,{Z:()=>a});var s=i("1dkX"),n=i("k46e"),o=i("Wuy/"),r=i("VKI/");const a=s.Z.extend({el:['<div class="widget slider-widget volume-slider-widget">','          <div class="widget-wrapper">','              <a class="fa-regular fa-volume-up"></a>','              <div class="bar">','                  <div class="slide">','                      <div class="cursor"></div>',"                  </div>","              </div>","          </div>","      </div>"].join(""),events:(0,n.Z)({},s.Z.prototype.events,{"click .fa":"onoff","touchstart .fa":"onoff"}),constructor:function(t,e){e=(0,o.Z)(e||{},{name:"volume",minimum:0,maximum:1,step:.1}),s.Z.prototype.constructor.call(this,t,e)},initialize:function(){s.Z.prototype.initialize.apply(this,arguments),this.isMute=0===this.get(),this.value=this.get(),this.model.on("change:"+this.options.name,(0,r.Z)(function(){0===this.get()?(this.isMute=!0,this.mute(this.$(".fa"))):this.isMute&&(this.isMute=!1,this.unmute(this.$(".fa")))}.bind(this)))},mute:function(t){t.removeClass("fa-volume-up").addClass("fa-volume-off")},unmute:function(t){t.removeClass("fa-volume-off").addClass("fa-volume-up")},onoff:function(){this.isMute?(0!==this.value&&null!==this.value||(this.value=1),this.model.set("mute",!1),this.set(this.value),this.model.set("playing",!0)):(this.value=this.get(),this.set(0),this.model.set("mute",!0))},cursorDrag:function(){s.Z.prototype.cursorDrag.apply(this,arguments),this.value=null}})},Iao2:(t,e,i)=>{"use strict";i.d(e,{Z:()=>h});var s=i("Hjnd"),n=i.n(s),o=i("k46e"),r=i("jQDz"),a=i("Sbzs"),c=i("Psgz"),d=i("OM1T"),l=i("ptuJ");const h=c.Z.extend({mixins:[d.Z,l.Z],el:'<div class="widget"/>',constructor:function(t,e){this.environment=(0,o.Z)({},t?t.environment:{},(e||{}).environment),this.options=e||{},this.collection=this.options.collection,this.model=this.options.model,c.Z.call(this,e)},initialize:function(t){c.Z.prototype.initialize.call(this,t),this.render(),void 0!==this.options.id&&(this.id=this.options.id,this.$el.attr("id",this.id)),void 0!==this.options.className&&(this.className=this.options.className,this.$el.addClass(this.className)),void 0!==this.options.title&&this.$el.attr("title",this.options.title)},$:function(t){var e=this.$el;return this.$el.find(t).filter((function(){return n()(this).parent().closest(".widget").is(e)}))},delegateEvents:function(t){t||(t=(0,r.Z)(this,"events")||{});var e=this.$el;return c.Z.prototype.delegateEvents.call(this,Object.keys(t).reduce(function(i,s){var o=t[s];return(0,a.Z)(o)||(o=this[t[s]]),o?(i[s]=function(t){t&&t.currentTarget&&!n()(t.currentTarget).closest(".widget").is(e)||o.apply(this,arguments)}.bind(this),i):i}.bind(this),{})),this.model&&this.model.on("change",this.modelChangeEvent,this),this},undelegateEvents:function(){return c.Z.prototype.undelegateEvents.apply(this,arguments),this.model&&this.model.off("change",this.modelChangeEvent,this),this},modelChangeEvent:function(){var t=this.options.name,e=t+".",i=!t,s=Object.keys(this.model.changedAttributes()||{}).some((function(i){return i===t||0===i.indexOf(e)}));(i||s)&&this.render()},change:function(t,e){1===arguments.length&&(e=t,t=void 0);var i=!0,s=function(){i=!1},n={target:this,which:t,value:e,preventDefault:s};return this.trigger("change.before",n),!!i&&(this.defaultAction(t,e),this.trigger("change"),!0)},defaultAction:function(t,e){this.set(e)},field:function(t){return this.options.name+(t?"."+t:"")},get:function(t){return this.model.get(this.field(t))},set:function(t,e){return 1===arguments.length&&(e=t,t=void 0),this.model.set(this.field(t),e)},disable:function(){this._disabled=!0,this.$el.addClass("disabled")},enable:function(){this._disabled=!1,this.$el.removeClass("disabled")}},{reify:function(){var t=arguments,e=this,i=function(){e.apply(this,t)};return i.prototype=this.prototype,new i}})},"0bhc":(t,e,i)=>{"use strict";i.d(e,{Z:()=>n});var s=i("JBVY");const n=function(t,e){if(window.parent){var i={type:"api.ready",instanceId:s.ZP.string("api_id",void 0),error:t,httpStatus:e};window.parent.postMessage(i,function(t){if(!t||!t.length)return"*";var e=t.split("//");return e[0]+"//"+e[1].split("/")[0]}(document.referrer))}}},BdNe:(t,e,i)=>{"use strict";var s=i("mSEu"),n=(i("Kt9T"),i("6KeQ"),i("X2SH"),i("MPb8"),i("eKF4")),o=i("abQY"),r=i("6y3v"),a=i("/c5M"),c=i("gAM8");if((0,o.Z)(),(0,r.Z)(),a.Z.install(),(0,c.Z)(),n.Z.init(),window.editorModels=window.editorModels||{},"dev"===s.Z.buildMode&&("local"===s.Z.env&&i.e(5448).then(i.bind(i,"qdmQ")).then((function(t){return t.default()})),USE_AXE))try{i.e(6411).then(i.bind(i,"qZF8"))}catch(t){}},"/TID":(t,e,i)=>{"use strict";i.d(e,{Z:()=>a});var s=i("UE/7"),n=i("tjn4"),o=i("lotc"),r=i("2jst");const a=n.Z.extend({optionTypes:{modelUid:o.Z.string},comparator:"order",model:s.Z,_trashbin:[],url:function(){return(0,r.Z)("animations",this.options.modelUid,this.options.checkPrefetch)}})},fb2z:(t,e,i)=>{"use strict";i.d(e,{Z:()=>a});var s=i("zF/U"),n=i("tjn4"),o=i("lotc"),r=i("2jst");const a=n.Z.extend({optionTypes:{modelUid:o.Z.string},model:s.Z,url:function(){return(0,r.Z)("backgrounds",this.options.modelUid,this.options.checkPrefetch)}})},CalZ:(t,e,i)=>{"use strict";i.d(e,{Z:()=>a});var s=i("ogfj"),n=i("tjn4"),o=i("lotc"),r=i("2jst");const a=n.Z.extend({optionTypes:{modelUid:o.Z.string},model:s.Z,url:function(){return(0,r.Z)("environments",this.options.modelUid,this.options.checkPrefetch)}})},zJM7:(t,e,i)=>{"use strict";i.d(e,{Z:()=>o});var s=i("tjn4"),n=i("QY8n");const o=s.Z.extend({model:n.Z,parse:function(t){return t.results.images},url:function(){return"/i/models/"+this.options.uid+"/fallback"}})},"E6+r":(t,e,i)=>{"use strict";i.d(e,{Z:()=>a});var s=i("YBVK"),n=i("tjn4"),o=i("lotc"),r=i("2jst");const a=n.Z.extend({optionTypes:{modelUid:o.Z.string},comparator:"order",model:s.Z,url:function(){return(0,r.Z)("hotspots",this.options.modelUid,this.options.checkPrefetch)}})},r5qc:(t,e,i)=>{"use strict";i.d(e,{Z:()=>d});var s=i("k46e"),n=i("Igo1"),o=i("tjn4"),r=i("lotc"),a=i("eNuK"),c=i("2jst");const d=o.Z.extend((0,s.Z)({optionTypes:{modelUid:r.Z.string},model:n.Z,url:function(){return(0,c.Z)("matcaps",this.options.modelUid,this.options.checkPrefetch)}},a.Z))},l1dI:(t,e,i)=>{"use strict";i.d(e,{Z:()=>a});var s=i("Zj2R"),n=i("tjn4"),o=i("lotc"),r=i("2jst");const a=n.Z.extend({optionTypes:{modelUid:o.Z.string},comparator:"order",model:s.Z,url:function(){return(0,r.Z)("sounds",this.options.modelUid,this.options.checkPrefetch)},modelId:function(t){return t.cid},triggerEditTrack:function(t){this.trigger("editTrack",t)},triggerDeleteTrack:function(t){this.trigger("removeTrack",t)},triggerDuplicateTrack:function(t){this.trigger("duplicateTrack",t)},triggerSelectTrack:function(t){this.trigger("select",t)}})},Sgtb:(t,e,i)=>{"use strict";i.d(e,{Z:()=>l});var s=i("k46e"),n=i("0aN2"),o=i("tjn4"),r=i("lotc"),a=i("l5lH"),c=i("eNuK"),d=i("2jst");const l=o.Z.extend((0,s.Z)({optionTypes:{modelUid:r.Z.string},model:n.Z,url:function(){return(0,d.Z)("textures",this.options.modelUid,this.options.checkPrefetch)},comparator:function(t,e){return"None"===t.get("label")?-1:"None"===e.get("label")?1:(0,a.Z)(t.get("label"),e.get("label"))},isValid:function(){this.each((function(t){t.isValid()}))},getImageFromURL:function(t){var e=t.split("/").pop();return this.find((function(t){var i=!1;return t.get("images").forEach((function(t){i||-1!==t.url.indexOf(e)&&(i=!0)})),i}))}},c.Z))},eNuK:(t,e,i)=>{"use strict";i.d(e,{Z:()=>n});var s=i("AyNe");const n={addNewImage:function(t){if(!this.model)throw new Error("This collection must implement a model.");var e,i=t.uid;i?e=i.replace(/tmp_/,""):i="tmp_"+(e=t.id||(0,s.Z)());var n=new this.model({images:[{uid:i,url:t.url,width:t.width,height:t.height}],uid:i,id:e,name:t.name||"newImage",imageFile:t.imageFile,internal:t.internal});return this.set(n,{merge:!0,add:!0,remove:!1}),n}}},"Qbh+":(t,e,i)=>{"use strict";i.d(e,{Z:()=>l});var s=i("xKIK"),n=i("QbBG"),o=i("KDlt"),r=i("7e5f"),a=i("E9rg");function c(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(t);e&&(s=s.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,s)}return i}function d(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?c(Object(i),!0).forEach((function(e){(0,s.Z)(t,e,i[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):c(Object(i)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))}))}return t}function l(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return r.Z.extend({displayName:"Popup",mixins:[a.Z],defaultOptions:d(d({},t.prototype.defaultOptions),e),children:{componentWrapper:{selector:".js-popup-content",viewClass:n.Z.extend({displayName:"PopupWrapper(".concat(t.prototype.displayName,")"),template:function(){return o.Z.getFromString("{{ components.child | component }}",{components:this.createChildrenComponents({child:{viewClass:t,options:this.options}})})}}),options:function(){return d(d({},this.options),{},{popup:{continue:this.continue.bind(this),cancel:this.cancel.bind(this),open:this.open.bind(this),close:this.close.bind(this),remove:this.remove.bind(this),show:this.show.bind(this),hide:this.hide.bind(this),resize:this.resize.bind(this),autofocus:this.autofocus.bind(this),isHidden:this.isHidden.bind(this)}})}}},template:function(){return o.Z.getFromString('\n                <div class="popup-container">\n                    <div class="popup-overlay"></div>\n                    <div class="js-popup js-popup-content c-popup__container"></div>\n                </div>\n                ',{})}})}},eaiT:(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/editor/b3777f2937566c93f348026b39105bd5-v2.png"},gS32:(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/editor/a737c0b59449a803c12c35dc4419bd30-v2.png"},"/R0b":(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/editor/e8b7f47873b16f8990c65b656d7d55c6-v2.png"},"48po":(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/editor/d91f3534ceb355a0ed921e8edcf93fb9-v2.png"},R25V:(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/editor/bcdcc09eeea51281eb4ac02cb4712675-v2.png"},xbNu:(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/editor/e60c7416f7f96f70ee26c9155975d380-v2.png"},XjOY:(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/editor/6645552faa13d6445515e0e39f4606f1-v2.png"},XywL:(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/viewer/e75739db52d049e0309547cab8bf1fa6-v2.png"},"2HFw":(t,e,i)=>{"use strict";t.exports=i.p+"static/assets/images/viewer/45755f41f22fab7274193ee039ee779e-v2.png"},C04p:t=>{"use strict";t.exports="b669ea4ccaf3e6454f25600fb048365c0d517999\n"},zpE6:()=>{}}]);