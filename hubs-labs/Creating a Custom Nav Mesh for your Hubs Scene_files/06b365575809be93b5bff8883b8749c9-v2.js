(self.webpackChunksketchfab=self.webpackChunksketchfab||[]).push([[1238],{F67Y:()=>{(window.nunjucksPrecompiled=window.nunjucksPrecompiled||{})["front/macros/model.jinja"]={root:function(e,o,t,a,s){var r=null,n=null,l="";try{var p=a.makeMacro(["model"],["options"],(function(s,l){var p=t;t=new a.Frame,(l=l||{}).hasOwnProperty("caller")&&t.set("caller",l.caller),t.set("model",s),t.set("options",l.hasOwnProperty("options")?l.options:{});var i,m,u="";return u+="\n    ",i=e.getFilter("merge").call(o,{withStaffpickFlag:!0,withStaffpickLink:!1,withRestrictedFlag:!0,displayRecentlyStaffpicked:!1},a.contextOrFrameLookup(o,t,"options")),t.set("options",i,!0),t.topLevel&&o.setVariable("options",i),t.topLevel&&o.addExport("options",i),u+="\n    ",m=a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"displayRecentlyStaffpicked")&&a.memberLookup(s,"recentlyStaffpicked"),t.set("recentlyStaffpicked",m,!0),t.topLevel&&o.setVariable("recentlyStaffpicked",m),t.topLevel&&o.addExport("recentlyStaffpicked",m),u+="\n\n    ",a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"withStaffpickLink")&&a.memberLookup(s,"staffpickedAt")?(u+='\n        <meta itemprop="award" content="Staff Pick" />\n        <a href="',u+=a.suppressValue((r=11,n=21,a.callWrap(a.contextOrFrameLookup(o,t,"url"),"url",o,["models:staffpicks"])),e.opts.autoescape),u+='" class="flag --staffpicked" title="See all staff picks"></a>\n    '):a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"withStaffpickFlag")&&a.memberLookup(s,"staffpickedAt")?(u+='\n        <meta itemprop="award" content="Staff Pick" />\n        <span class="flag --staffpicked ',a.contextOrFrameLookup(o,t,"recentlyStaffpicked")&&(u+="--with-text"),u+='" title="Staff Picks"></span>\n    ',u+="\n    "):0==a.memberLookup(s,"isPublished")&&(u+='\n        <span class="flag --draft"></span>\n    '),u+="\n\n    ",(a.memberLookup(s,"isRestricted")||a.memberLookup(s,"isAdult"))&&(u+="\n        ",a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"withRestrictedFlag")&&(u+='\n            <a\n                href="https://help.sketchfab.com/hc/en-us/articles/214867883-What-is-Restricted-Content-?utm_source=website&utm_campaign=restrictedcontent"\n                target="_blank"\n                class="flag --restricted"\n                title="Restricted Content"\n                rel="noopener noreferrer"></a>\n        '),u+="\n    "),u+="\n",t=p,new a.SafeString(u)}));o.addExport("model_labels"),o.setVariable("model_labels",p),l+="\n\n";var i=a.makeMacro(["model"],["options"],(function(s,l){var p=t;t=new a.Frame,(l=l||{}).hasOwnProperty("caller")&&t.set("caller",l.caller),t.set("model",s),t.set("options",l.hasOwnProperty("options")?l.options:{});var i,m="";return i=e.getFilter("merge").call(o,{clickable:!0},a.contextOrFrameLookup(o,t,"options")),t.set("options",i,!0),t.topLevel&&o.setVariable("options",i),t.topLevel&&o.addExport("options",i),m+='<span class="model-name">\n\n        ',a.memberLookup(s,"visibility")&&(m+="\n            ","private"==a.memberLookup(s,"visibility")?m+='\n                <i class="icon viewer-icon-eye-slash"></i>\n            ':"protected"==a.memberLookup(s,"visibility")&&(m+='\n                <i class="icon viewer-icon-lock"></i>\n            '),m+="\n        "),m+="\n\n        ",a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"clickable")?(m+='\n            <a class="model-name__label" data-route href="',m+=a.suppressValue(a.memberLookup(s,"viewerUrl"),e.opts.autoescape),m+='"',a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"target")&&(m+=' target="',m+=a.suppressValue(a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"target"),e.opts.autoescape),m+='"'),m+=' title="',m+=a.suppressValue("store"==a.memberLookup(s,"downloadType")?"Buy ":"",e.opts.autoescape),m+=a.suppressValue(a.memberLookup(s,"name"),e.opts.autoescape),m+=' 3D Model">',m+=a.suppressValue(a.memberLookup(s,"name"),e.opts.autoescape),m+="</a>\n        "):(m+='\n            <span class="model-name__label">',m+=a.suppressValue(a.memberLookup(s,"name"),e.opts.autoescape),m+="</span>\n        "),m+="\n\n        ",m+=a.suppressValue((r=52,n=21,a.callWrap(a.contextOrFrameLookup(o,t,"model_labels"),"model_labels",o,[s,a.contextOrFrameLookup(o,t,"options")])),e.opts.autoescape),m+="\n\n    </span>",t=p,new a.SafeString(m)}));o.addExport("model_name"),o.setVariable("model_name",i),l+="\n\n";var m=a.makeMacro(["model"],["options"],(function(s,r){var n=t;t=new a.Frame,(r=r||{}).hasOwnProperty("caller")&&t.set("caller",r.caller),t.set("model",s),t.set("options",r.hasOwnProperty("options")?r.options:{});var l,p,i,m,u,c,d,k="";return l=e.getFilter("merge").call(o,{withUsernameMention:!0,withSuffix:!1,withUid:!0},a.contextOrFrameLookup(o,t,"options")),t.set("options",l,!0),t.topLevel&&o.setVariable("options",l),t.topLevel&&o.addExport("options",l),p=a.memberLookup(s,"org")?a.memberLookup(s,"org"):a.memberLookup(s,"user"),t.set("uploader",p,!0),t.topLevel&&o.setVariable("uploader",p),t.topLevel&&o.addExport("uploader",p),i=a.memberLookup(s,"name")||"",t.set("model_name",i,!0),t.topLevel&&o.setVariable("model_name",i),t.topLevel&&o.addExport("model_name",i),m="store"==a.memberLookup(s,"downloadType")?"Buy Royalty Free ":"free"==a.memberLookup(s,"downloadType")?"Download Free ":"",t.set("download_message",m,!0),t.topLevel&&o.setVariable("download_message",m),t.topLevel&&o.addExport("download_message",m),u=a.memberLookup(a.contextOrFrameLookup(o,t,"uploader"),"displayName")+(a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"withUsernameMention")&&e.getFilter("lower").call(o,a.memberLookup(a.contextOrFrameLookup(o,t,"uploader"),"displayName"))!=e.getFilter("lower").call(o,a.memberLookup(a.contextOrFrameLookup(o,t,"uploader"),"username"))?" (@"+a.memberLookup(a.contextOrFrameLookup(o,t,"uploader"),"username")+")":""),t.set("username_mention",u,!0),t.topLevel&&o.setVariable("username_mention",u),t.topLevel&&o.addExport("username_mention",u),c=a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"withUid")?" ["+e.getFilter("truncate").call(o,a.memberLookup(s,"uid"),a.makeKeywordArgs({length:7,killwords:a.contextOrFrameLookup(o,t,"True"),end:""}))+"]":"",t.set("uid",c,!0),t.topLevel&&o.setVariable("uid",c),t.topLevel&&o.addExport("uid",c),d=a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"withSuffix")?" - Sketchfab"+("store"==a.memberLookup(s,"downloadType")?" Store":""):"",t.set("suffix",d,!0),t.topLevel&&o.setVariable("suffix",d),t.topLevel&&o.addExport("suffix",d),k+=a.suppressValue(a.contextOrFrameLookup(o,t,"model_name")+" - "+a.contextOrFrameLookup(o,t,"download_message")+"3D model by "+a.contextOrFrameLookup(o,t,"username_mention")+a.contextOrFrameLookup(o,t,"uid")+a.contextOrFrameLookup(o,t,"suffix"),e.opts.autoescape),t=n,new a.SafeString(k)}));o.addExport("model_page_title"),o.setVariable("model_page_title",m),l+="\n\n";var u=a.makeMacro(["list"],["options"],(function(s,l){var p=t;t=new a.Frame,(l=l||{}).hasOwnProperty("caller")&&t.set("caller",l.caller),t.set("list",s),t.set("options",l.hasOwnProperty("options")?l.options:{});var i,m,u,c="";i=e.getFilter("merge").call(o,{maxDisplayed:3,othersHref:""},a.contextOrFrameLookup(o,t,"options")),t.set("options",i,!0),t.topLevel&&o.setVariable("options",i),t.topLevel&&o.addExport("options",i),m=e.getFilter("first_n").call(o,s,a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"maxDisplayed")),t.set("shortList",m,!0),t.topLevel&&o.setVariable("shortList",m),t.topLevel&&o.addExport("shortList",m),u=e.getFilter("length").call(o,s)-e.getFilter("length").call(o,a.contextOrFrameLookup(o,t,"shortList")),t.set("otherCount",u,!0),t.topLevel&&o.setVariable("otherCount",u),t.topLevel&&o.addExport("otherCount",u),t=t.push();var d=a.contextOrFrameLookup(o,t,"shortList");if(d)for(var k=d.length,L=0;L<d.length;L++){var b=d[L];t.set("model",b),t.set("loop.index",L+1),t.set("loop.index0",L),t.set("loop.revindex",k-L),t.set("loop.revindex0",k-L-1),t.set("loop.first",0===L),t.set("loop.last",L===k-1),t.set("loop.length",k),a.memberLookup(a.contextOrFrameLookup(o,t,"loop"),"first")||(a.memberLookup(a.contextOrFrameLookup(o,t,"loop"),"last")&&a.contextOrFrameLookup(o,t,"otherCount")<1?c+="<span> and </span>":c+="<span>, </span>"),c+=a.suppressValue((r=126,n=19,a.callWrap(a.contextOrFrameLookup(o,t,"model_name"),"model_name",o,[b,{withStaffpickFlag:!1,withStaffpickLink:!1,withRestrictedFlag:!1}])),e.opts.autoescape)}return t=t.pop(),a.contextOrFrameLookup(o,t,"otherCount")>0&&(a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"othersHref")?(c+='<a href="',c+=a.suppressValue(a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"othersHref"),e.opts.autoescape),c+='" class="others"> and ',c+=a.suppressValue(a.contextOrFrameLookup(o,t,"otherCount"),e.opts.autoescape),c+=" other",c+=a.suppressValue(e.getFilter("pluralize").call(o,a.contextOrFrameLookup(o,t,"otherCount")),e.opts.autoescape),c+="</a>"):(c+='<span class="others"> and ',c+=a.suppressValue(a.contextOrFrameLookup(o,t,"otherCount"),e.opts.autoescape),c+=" other",c+=a.suppressValue(e.getFilter("pluralize").call(o,a.contextOrFrameLookup(o,t,"otherCount")),e.opts.autoescape),c+="</span>")),t=p,new a.SafeString(c)}));o.addExport("model_name_list"),o.setVariable("model_name_list",u),l+="\n\n";var c=a.makeMacro([],["options"],(function(e){var s=t;t=new a.Frame,(e=e||{}).hasOwnProperty("caller")&&t.set("caller",e.caller),t.set("options",e.hasOwnProperty("options")?e.options:{});var r="";return r+='\n\n    <ul class="hover-menu quicksettings corner',"up"==a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"direction")&&(r+=" hover-menu-up"),"left"==a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"direction")&&(r+=" --left"),r+='">\n        <li><a data-action="remove-model">Remove</a></li>\n    </ul>\n\n',t=s,new a.SafeString(r)}));o.addExport("collection_item_quicksettings"),o.setVariable("collection_item_quicksettings",c),l+="\n\n",l+="\n";var d=a.makeMacro(["authUser","model"],["options"],(function(s,l,p){var i=t;t=new a.Frame,(p=p||{}).hasOwnProperty("caller")&&t.set("caller",p.caller),t.set("authUser",s),t.set("model",l),t.set("options",p.hasOwnProperty("options")?p.options:{});var m,u="";return u+='\n    <div class="model-uploadcard">',m=e.getFilter("merge").call(o,{withStaffpickFlag:!1},a.contextOrFrameLookup(o,t,"options")),t.set("options",m,!0),t.topLevel&&o.setVariable("options",m),t.topLevel&&o.addExport("options",m),u+='<p class="filename">',a.memberLookup(l,"name")?u+=a.suppressValue((r=157,n=27,a.callWrap(a.contextOrFrameLookup(o,t,"model_name"),"model_name",o,[l,a.contextOrFrameLookup(o,t,"options")])),e.opts.autoescape):(u+='<a data-route href="',u+=a.suppressValue(a.memberLookup(l,"viewerUrl"),e.opts.autoescape),u+='">\n                    ',u+=a.suppressValue(e.getFilter("default").call(o,a.memberLookup(l,"originalFileName"),"No file name"),e.opts.autoescape),u+="\n                </a>"),u+='</p>\n        <div class="meta">\n            ',a.memberLookup(l,"isPublished")?a.memberLookup(l,"processedAt")?(u+='\n                <span class="date" title="',u+=a.suppressValue(a.memberLookup(l,"processedAt"),e.opts.autoescape),u+='">',u+=a.suppressValue(e.getFilter("time_ago").call(o,a.memberLookup(l,"processedAt")),e.opts.autoescape),u+="</span>\n            "):(u+='\n                <span class="date" title="',u+=a.suppressValue(a.memberLookup(l,"createdAt"),e.opts.autoescape),u+='">',u+=a.suppressValue(e.getFilter("time_ago").call(o,a.memberLookup(l,"createdAt")),e.opts.autoescape),u+="</span>\n            "):(u+='\n                <span class="help">\n                    <span class="date">Expires on ',u+=a.suppressValue(e.getFilter("get_delete_draft_date").call(o,a.memberLookup(l,"createdAt")),e.opts.autoescape),u+='</span>\n                    <div class="tooltip tooltip-down">This model will be deleted automatically on ',u+=a.suppressValue(e.getFilter("get_delete_draft_date").call(o,a.memberLookup(l,"createdAt")),e.opts.autoescape),u+="</div>\n                </span>\n            "),u+='\n        </div>\n\n        <div class="status">',0==a.memberLookup(l,"processingStatus")?u+='<div class="help">\n                    <i class="icon spinner-small-slow"></i>\n                    <div class="tooltip tooltip-down">Pending</div>\n                </div>':1==a.memberLookup(l,"processingStatus")?u+='<div class="help">\n                    <i class="icon spinner-small"></i>\n                    <div class="tooltip tooltip-down">Processing</div>\n                </div>':2==a.memberLookup(l,"processingStatus")?a.memberLookup(l,"isPublished")?u+='<div class="help">\n                        <i class="icon fa-regular fa-check"></i>\n                        <div class="tooltip tooltip-down">Published</div>\n                    </div>':(u+='<div class="js-publish-button">\n                        <button type="button" class="button btn-important btn-medium">\n                            Publish\n                        </button>\n                    </div>\n\n                    <a href="',u+=a.suppressValue(a.memberLookup(l,"editorUrl"),e.opts.autoescape),u+='" class="button btn-tertiary btn-medium btn-edit" data-action="edit">\n                        3D Settings\n                    </a>'):3==a.memberLookup(l,"processingStatus")&&(u+='<div class="help">\n                    <i class="icon fa-regular fa-times"></i>\n                    <div class="tooltip tooltip-down">Error</div>\n                </div>'),u+='</div>\n\n        <div class="model-uploadcard-settings">\n            <div class="button btn-medium btn-primary display-icon-only"',a.memberLookup(l,"processingStatus")<2&&(u+=" disabled"),u+='>\n                <i class="fa-regular fa-cog"></i>\n                <div class="js-quicksettings"></div>\n            </div>\n        </div>\n\n    </div>\n\n',t=i,new a.SafeString(u)}));o.addExport("model_uploadcard"),o.setVariable("model_uploadcard",d),l+="\n\n\n";var k=a.makeMacro([],["options"],(function(s){var r=t;t=new a.Frame,(s=s||{}).hasOwnProperty("caller")&&t.set("caller",s.caller),t.set("options",s.hasOwnProperty("options")?s.options:{});var n="";return n+='\n    <div class="annotation" data-hotspot="',n+=a.suppressValue(a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"hotspotIndex"),e.opts.autoescape),n+='">\n        <div class="tooltip">\n            <form class="tooltip-content">\n                <div class="edition">\n                    <input class="title" placeholder="Title *" maxlength="64" required>\n                    <textarea class="description" placeholder="Description (add links, images and other formatting with Markdown)" maxlength="1024" rows="2"></textarea>\n                </div>\n                <div class="render">\n                    <div class="title"></div>\n                    <div class="markdown-editor">\n                        <div class="description markdown-rendered-content inversed"></div>\n                    </div>\n                </div>\n                <div class="meta">\n                    <button type="submit" class="submit button btn-primary btn-small">OK</button>\n                    <div class="meta__mode">\n                        <i class="fa-regular fa-pencil activate-edition selected" title="Edit"></i>\n                        <i class="fa-regular fa-eye activate-render" title="Preview"></i>\n                    </div>\n                </div>\n            </form>\n        </div>\n    </div>\n',t=r,new a.SafeString(n)}));o.addExport("model_hotspot_edit"),o.setVariable("model_hotspot_edit",k),l+="\n\n";var L=a.makeMacro(["src"],["options"],(function(s,r){var n=t;t=new a.Frame,(r=r||{}).hasOwnProperty("caller")&&t.set("caller",r.caller),t.set("src",s),t.set("options",r.hasOwnProperty("options")?r.options:{});var l,p="";return l=e.getFilter("merge").call(o,{title:"A 3D model"},a.contextOrFrameLookup(o,t,"options")),t.set("options",l,!0),t.topLevel&&o.setVariable("options",l),t.topLevel&&o.addExport("options",l),p+="\n    <iframe ",p+=a.suppressValue(e.getFilter("attributes").call(o,{id:a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"id"),title:a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"title"),class:a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"class"),width:a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"width"),height:a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"height"),src:s,frameborder:"0",allow:"autoplay; fullscreen; xr-spatial-tracking",allowfullscreen:"",mozallowfullscreen:"true",webkitallowfullscreen:"true","xr-spatial-tracking":"true","execution-while-out-of-viewport":"true","execution-while-not-rendered":"true","web-share":"true"}),e.opts.autoescape),p+="></iframe>",t=n,new a.SafeString(p)}));o.addExport("model_iframe"),o.setVariable("model_iframe",L),l+="\n\n";var b=a.makeMacro(["model"],["options"],(function(s,r){var n=t;t=new a.Frame,(r=r||{}).hasOwnProperty("caller")&&t.set("caller",r.caller),t.set("model",s),t.set("options",r.hasOwnProperty("options")?r.options:{});var l,p="";return p+="\n    ",l=e.getFilter("merge").call(o,{className:""},a.contextOrFrameLookup(o,t,"options")),t.set("options",l,!0),t.topLevel&&o.setVariable("options",l),t.topLevel&&o.addExport("options",l),p+='\n    <span class="',p+=a.suppressValue(a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"className"),e.opts.autoescape),p+=' fa-regular fa-eye help">\n        <span class="count">\n            ',p+=a.suppressValue(e.getFilter("humanize_number").call(o,a.memberLookup(s,"viewCount")),e.opts.autoescape),p+='\n        </span>\n        <span class="tooltip tooltip-up">Views</span>\n    </span>\n',t=n,new a.SafeString(p)}));o.addExport("model_view_count"),o.setVariable("model_view_count",b),l+="\n\n";var v=a.makeMacro(["model"],["options"],(function(s,l){var p=t;t=new a.Frame,(l=l||{}).hasOwnProperty("caller")&&t.set("caller",l.caller),t.set("model",s),t.set("options",l.hasOwnProperty("options")?l.options:{});var i,m="";return i=e.getFilter("merge").call(o,{isMine:!1},a.contextOrFrameLookup(o,t,"options")),t.set("options",i,!0),t.topLevel&&o.setVariable("options",i),t.topLevel&&o.addExport("options",i),m+='<div class="model-cell__name-container">\n        <p class="model-cell__name ',m+=a.suppressValue(a.memberLookup(s,"isDeleted")?"--deleted":"",e.opts.autoescape),m+='">\n            ',m+=a.suppressValue((r=300,n=23,a.callWrap(a.contextOrFrameLookup(o,t,"model_name"),"model_name",o,[s,{clickable:!a.memberLookup(s,"isDeleted")}])),e.opts.autoescape),m+="\n        </p>\n\n        ",a.memberLookup(s,"isDeleted")&&(m+='\n            <span class="model-cell__deleted-tooltip help">\n                <i class="fa-regular fa-question-circle"></i>\n                <span class="tooltip tooltip-right">\n                    This model was deleted',m+=a.suppressValue(a.memberLookup(a.contextOrFrameLookup(o,t,"options"),"isMine")?"":", but no worries, you can still download the latest version!",e.opts.autoescape),m+="\n                </span>\n            </span>\n        "),m+="\n    </div>\n",t=p,new a.SafeString(m)}));o.addExport("model_cell_name"),o.setVariable("model_cell_name",v),s(null,l+="\n")}catch(e){s(a.handleError(e,r,n))}}}}}]);