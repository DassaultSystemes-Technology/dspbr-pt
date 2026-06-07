var Ll=Object.defineProperty;var Ul=(n,e,t)=>e in n?Ll(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var y=(n,e,t)=>Ul(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();/*! Tweakpane 4.0.5 (c) 2016 cocopon, licensed under the MIT license. */function q(n){return n==null}function Ya(n){return n!==null&&typeof n=="object"}function Fa(n){return n!==null&&typeof n=="object"}function Gl(n,e){if(n.length!==e.length)return!1;for(let t=0;t<n.length;t++)if(n[t]!==e[t])return!1;return!0}function At(n,e){return Array.from(new Set([...Object.keys(n),...Object.keys(e)])).reduce((a,r)=>{const s=n[r],i=e[r];return Fa(s)&&Fa(i)?Object.assign(Object.assign({},a),{[r]:At(s,i)}):Object.assign(Object.assign({},a),{[r]:r in e?i:s})},{})}function $a(n){return Ya(n)?"target"in n:!1}const Wl={alreadydisposed:()=>"View has been already disposed",invalidparams:n=>`Invalid parameters for '${n.name}'`,nomatchingcontroller:n=>`No matching controller for '${n.key}'`,nomatchingview:n=>`No matching view for '${JSON.stringify(n.params)}'`,notbindable:()=>"Value is not bindable",notcompatible:n=>`Not compatible with  plugin '${n.id}'`,propertynotfound:n=>`Property '${n.name}' not found`,shouldneverhappen:()=>"This error should never happen"};class te{static alreadyDisposed(){return new te({type:"alreadydisposed"})}static notBindable(){return new te({type:"notbindable"})}static notCompatible(e,t){return new te({type:"notcompatible",context:{id:`${e}.${t}`}})}static propertyNotFound(e){return new te({type:"propertynotfound",context:{name:e}})}static shouldNeverHappen(){return new te({type:"shouldneverhappen"})}constructor(e){var t;this.message=(t=Wl[e.type](e.context))!==null&&t!==void 0?t:"Unexpected error",this.name=this.constructor.name,this.stack=new Error(this.message).stack,this.type=e.type}toString(){return this.message}}class ea{constructor(e,t){this.obj_=e,this.key=t}static isBindable(e){return!(e===null||typeof e!="object"&&typeof e!="function")}read(){return this.obj_[this.key]}write(e){this.obj_[this.key]=e}writeProperty(e,t){const a=this.read();if(!ea.isBindable(a))throw te.notBindable();if(!(e in a))throw te.propertyNotFound(e);a[e]=t}}class ae{constructor(){this.observers_={}}on(e,t,a){var r;let s=this.observers_[e];return s||(s=this.observers_[e]=[]),s.push({handler:t,key:(r=a==null?void 0:a.key)!==null&&r!==void 0?r:t}),this}off(e,t){const a=this.observers_[e];return a&&(this.observers_[e]=a.filter(r=>r.key!==t)),this}emit(e,t){const a=this.observers_[e];a&&a.forEach(r=>{r.handler(t)})}}class zl{constructor(e,t){var a;this.constraint_=t==null?void 0:t.constraint,this.equals_=(a=t==null?void 0:t.equals)!==null&&a!==void 0?a:((r,s)=>r===s),this.emitter=new ae,this.rawValue_=e}get constraint(){return this.constraint_}get rawValue(){return this.rawValue_}set rawValue(e){this.setRawValue(e,{forceEmit:!1,last:!0})}setRawValue(e,t){const a=t??{forceEmit:!1,last:!0},r=this.constraint_?this.constraint_.constrain(e):e,s=this.rawValue_;this.equals_(s,r)&&!a.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.rawValue_=r,this.emitter.emit("change",{options:a,previousRawValue:s,rawValue:r,sender:this}))}}class Hl{constructor(e){this.emitter=new ae,this.value_=e}get rawValue(){return this.value_}set rawValue(e){this.setRawValue(e,{forceEmit:!1,last:!0})}setRawValue(e,t){const a=t??{forceEmit:!1,last:!0},r=this.value_;r===e&&!a.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.value_=e,this.emitter.emit("change",{options:a,previousRawValue:r,rawValue:this.value_,sender:this}))}}class Xl{constructor(e){this.emitter=new ae,this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.value_=e,this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_)}get rawValue(){return this.value_.rawValue}onValueBeforeChange_(e){this.emitter.emit("beforechange",Object.assign(Object.assign({},e),{sender:this}))}onValueChange_(e){this.emitter.emit("change",Object.assign(Object.assign({},e),{sender:this}))}}function Y(n,e){const t=e==null?void 0:e.constraint,a=e==null?void 0:e.equals;return!t&&!a?new Hl(n):new zl(n,e)}function Kl(n){return[new Xl(n),(e,t)=>{n.setRawValue(e,t)}]}class V{constructor(e){this.emitter=new ae,this.valMap_=e;for(const t in this.valMap_)this.valMap_[t].emitter.on("change",()=>{this.emitter.emit("change",{key:t,sender:this})})}static createCore(e){return Object.keys(e).reduce((a,r)=>Object.assign(a,{[r]:Y(e[r])}),{})}static fromObject(e){const t=this.createCore(e);return new V(t)}get(e){return this.valMap_[e].rawValue}set(e,t){this.valMap_[e].rawValue=t}value(e){return this.valMap_[e]}}class An{constructor(e){this.values=V.fromObject({max:e.max,min:e.min})}constrain(e){const t=this.values.get("max"),a=this.values.get("min");return Math.min(Math.max(e,a),t)}}class ql{constructor(e){this.values=V.fromObject({max:e.max,min:e.min})}constrain(e){const t=this.values.get("max"),a=this.values.get("min");let r=e;return q(a)||(r=Math.max(r,a)),q(t)||(r=Math.min(r,t)),r}}class Jl{constructor(e,t=0){this.step=e,this.origin=t}constrain(e){const t=this.origin%this.step,a=Math.round((e-t)/this.step);return t+a*this.step}}class Yl{constructor(e){this.text=e}evaluate(){return Number(this.text)}toString(){return this.text}}const $l={"**":(n,e)=>Math.pow(n,e),"*":(n,e)=>n*e,"/":(n,e)=>n/e,"%":(n,e)=>n%e,"+":(n,e)=>n+e,"-":(n,e)=>n-e,"<<":(n,e)=>n<<e,">>":(n,e)=>n>>e,">>>":(n,e)=>n>>>e,"&":(n,e)=>n&e,"^":(n,e)=>n^e,"|":(n,e)=>n|e};class Ql{constructor(e,t,a){this.left=t,this.operator=e,this.right=a}evaluate(){const e=$l[this.operator];if(!e)throw new Error(`unexpected binary operator: '${this.operator}`);return e(this.left.evaluate(),this.right.evaluate())}toString(){return["b(",this.left.toString(),this.operator,this.right.toString(),")"].join(" ")}}const Zl={"+":n=>n,"-":n=>-n,"~":n=>~n};class ec{constructor(e,t){this.operator=e,this.expression=t}evaluate(){const e=Zl[this.operator];if(!e)throw new Error(`unexpected unary operator: '${this.operator}`);return e(this.expression.evaluate())}toString(){return["u(",this.operator,this.expression.toString(),")"].join(" ")}}function Qa(n){return(e,t)=>{for(let a=0;a<n.length;a++){const r=n[a](e,t);if(r!=="")return r}return""}}function gn(n,e){var t;const a=n.substr(e).match(/^\s+/);return(t=a&&a[0])!==null&&t!==void 0?t:""}function tc(n,e){const t=n.substr(e,1);return t.match(/^[1-9]$/)?t:""}function vn(n,e){var t;const a=n.substr(e).match(/^[0-9]+/);return(t=a&&a[0])!==null&&t!==void 0?t:""}function nc(n,e){const t=vn(n,e);if(t!=="")return t;const a=n.substr(e,1);if(e+=1,a!=="-"&&a!=="+")return"";const r=vn(n,e);return r===""?"":a+r}function Za(n,e){const t=n.substr(e,1);if(e+=1,t.toLowerCase()!=="e")return"";const a=nc(n,e);return a===""?"":t+a}function vi(n,e){const t=n.substr(e,1);if(t==="0")return t;const a=tc(n,e);return e+=a.length,a===""?"":a+vn(n,e)}function ac(n,e){const t=vi(n,e);if(e+=t.length,t==="")return"";const a=n.substr(e,1);if(e+=a.length,a!==".")return"";const r=vn(n,e);return e+=r.length,t+a+r+Za(n,e)}function rc(n,e){const t=n.substr(e,1);if(e+=t.length,t!==".")return"";const a=vn(n,e);return e+=a.length,a===""?"":t+a+Za(n,e)}function sc(n,e){const t=vi(n,e);return e+=t.length,t===""?"":t+Za(n,e)}const ic=Qa([ac,rc,sc]);function oc(n,e){var t;const a=n.substr(e).match(/^[01]+/);return(t=a&&a[0])!==null&&t!==void 0?t:""}function lc(n,e){const t=n.substr(e,2);if(e+=t.length,t.toLowerCase()!=="0b")return"";const a=oc(n,e);return a===""?"":t+a}function cc(n,e){var t;const a=n.substr(e).match(/^[0-7]+/);return(t=a&&a[0])!==null&&t!==void 0?t:""}function uc(n,e){const t=n.substr(e,2);if(e+=t.length,t.toLowerCase()!=="0o")return"";const a=cc(n,e);return a===""?"":t+a}function _c(n,e){var t;const a=n.substr(e).match(/^[0-9a-f]+/i);return(t=a&&a[0])!==null&&t!==void 0?t:""}function dc(n,e){const t=n.substr(e,2);if(e+=t.length,t.toLowerCase()!=="0x")return"";const a=_c(n,e);return a===""?"":t+a}const hc=Qa([lc,uc,dc]),fc=Qa([hc,ic]);function pc(n,e){const t=fc(n,e);return e+=t.length,t===""?null:{evaluable:new Yl(t),cursor:e}}function bc(n,e){const t=n.substr(e,1);if(e+=t.length,t!=="(")return null;const a=Si(n,e);if(!a)return null;e=a.cursor,e+=gn(n,e).length;const r=n.substr(e,1);return e+=r.length,r!==")"?null:{evaluable:a.evaluable,cursor:e}}function mc(n,e){var t;return(t=pc(n,e))!==null&&t!==void 0?t:bc(n,e)}function xi(n,e){const t=mc(n,e);if(t)return t;const a=n.substr(e,1);if(e+=a.length,a!=="+"&&a!=="-"&&a!=="~")return null;const r=xi(n,e);return r?(e=r.cursor,{cursor:e,evaluable:new ec(a,r.evaluable)}):null}function gc(n,e,t){t+=gn(e,t).length;const a=n.filter(r=>e.startsWith(r,t))[0];return a?(t+=a.length,t+=gn(e,t).length,{cursor:t,operator:a}):null}function vc(n,e){return(t,a)=>{const r=n(t,a);if(!r)return null;a=r.cursor;let s=r.evaluable;for(;;){const i=gc(e,t,a);if(!i)break;a=i.cursor;const o=n(t,a);if(!o)return null;a=o.cursor,s=new Ql(i.operator,s,o.evaluable)}return s?{cursor:a,evaluable:s}:null}}const xc=[["**"],["*","/","%"],["+","-"],["<<",">>>",">>"],["&"],["^"],["|"]].reduce((n,e)=>vc(n,e),xi);function Si(n,e){return e+=gn(n,e).length,xc(n,e)}function Sc(n){const e=Si(n,0);return!e||e.cursor+gn(n,e.cursor).length!==n.length?null:e.evaluable}function ut(n){var e;const t=Sc(n);return(e=t==null?void 0:t.evaluate())!==null&&e!==void 0?e:null}function Ti(n){if(typeof n=="number")return n;if(typeof n=="string"){const e=ut(n);if(!q(e))return e}return 0}function Tc(n){return String(n)}function xe(n){return e=>e.toFixed(Math.max(Math.min(n,20),0))}function z(n,e,t,a,r){const s=(n-e)/(t-e);return a+s*(r-a)}function fs(n){return String(n.toFixed(10)).split(".")[1].replace(/0+$/,"").length}function se(n,e,t){return Math.min(Math.max(n,e),t)}function wi(n,e){return(n%e+e)%e}function wc(n,e){return q(n.step)?Math.max(fs(e),2):fs(n.step)}function yi(n){var e;return(e=n.step)!==null&&e!==void 0?e:1}function Ei(n,e){var t;const a=Math.abs((t=n.step)!==null&&t!==void 0?t:e);return a===0?.1:Math.pow(10,Math.floor(Math.log10(a))-1)}function Ci(n,e){return q(n.step)?null:new Jl(n.step,e)}function Ii(n){return!q(n.max)&&!q(n.min)?new An({max:n.max,min:n.min}):!q(n.max)||!q(n.min)?new ql({max:n.max,min:n.min}):null}function Ri(n,e){var t,a,r;return{formatter:(t=n.format)!==null&&t!==void 0?t:xe(wc(n,e)),keyScale:(a=n.keyScale)!==null&&a!==void 0?a:yi(n),pointerScale:(r=n.pointerScale)!==null&&r!==void 0?r:Ei(n,e)}}function Ai(n){return{format:n.optional.function,keyScale:n.optional.number,max:n.optional.number,min:n.optional.number,pointerScale:n.optional.number,step:n.optional.number}}function er(n){return{constraint:n.constraint,textProps:V.fromObject(Ri(n.params,n.initialValue))}}class Ft{constructor(e){this.controller=e}get element(){return this.controller.view.element}get disabled(){return this.controller.viewProps.get("disabled")}set disabled(e){this.controller.viewProps.set("disabled",e)}get hidden(){return this.controller.viewProps.get("hidden")}set hidden(e){this.controller.viewProps.set("hidden",e)}dispose(){this.controller.viewProps.set("disposed",!0)}importState(e){return this.controller.importState(e)}exportState(){return this.controller.exportState()}}class da{constructor(e){this.target=e}}class Dn extends da{constructor(e,t,a){super(e),this.value=t,this.last=a??!0}}class yc extends da{constructor(e,t){super(e),this.expanded=t}}class Ec extends da{constructor(e,t){super(e),this.index=t}}class Cc extends da{constructor(e,t){super(e),this.native=t}}class xn extends Ft{constructor(e){super(e),this.onValueChange_=this.onValueChange_.bind(this),this.emitter_=new ae,this.controller.value.emitter.on("change",this.onValueChange_)}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get key(){return this.controller.value.binding.target.key}get tag(){return this.controller.tag}set tag(e){this.controller.tag=e}on(e,t){const a=t.bind(this);return this.emitter_.on(e,r=>{a(r)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}refresh(){this.controller.value.fetch()}onValueChange_(e){const t=this.controller.value;this.emitter_.emit("change",new Dn(this,t.binding.target.read(),e.options.last))}}class Ic{constructor(e,t){this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.binding=t,this.value_=e,this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_),this.emitter=new ae}get rawValue(){return this.value_.rawValue}set rawValue(e){this.value_.rawValue=e}setRawValue(e,t){this.value_.setRawValue(e,t)}fetch(){this.value_.rawValue=this.binding.read()}push(){this.binding.write(this.value_.rawValue)}onValueBeforeChange_(e){this.emitter.emit("beforechange",Object.assign(Object.assign({},e),{sender:this}))}onValueChange_(e){this.push(),this.emitter.emit("change",Object.assign(Object.assign({},e),{sender:this}))}}function Rc(n){if(!("binding"in n))return!1;const e=n.binding;return $a(e)&&"read"in e&&"write"in e}function Ac(n,e){const a=Object.keys(e).reduce((r,s)=>{if(r===void 0)return;const i=e[s],o=i(n[s]);return o.succeeded?Object.assign(Object.assign({},r),{[s]:o.value}):void 0},{});return a}function Dc(n,e){return n.reduce((t,a)=>{if(t===void 0)return;const r=e(a);if(!(!r.succeeded||r.value===void 0))return[...t,r.value]},[])}function Mc(n){return n===null?!1:typeof n=="object"}function He(n){return e=>t=>{if(!e&&t===void 0)return{succeeded:!1,value:void 0};if(e&&t===void 0)return{succeeded:!0,value:void 0};const a=n(t);return a!==void 0?{succeeded:!0,value:a}:{succeeded:!1,value:void 0}}}function ps(n){return{custom:e=>He(e)(n),boolean:He(e=>typeof e=="boolean"?e:void 0)(n),number:He(e=>typeof e=="number"?e:void 0)(n),string:He(e=>typeof e=="string"?e:void 0)(n),function:He(e=>typeof e=="function"?e:void 0)(n),constant:e=>He(t=>t===e?e:void 0)(n),raw:He(e=>e)(n),object:e=>He(t=>{if(Mc(t))return Ac(t,e)})(n),array:e=>He(t=>{if(Array.isArray(t))return Dc(t,e)})(n)}}const ka={optional:ps(!0),required:ps(!1)};function Q(n,e){const t=e(ka),a=ka.required.object(t)(n);return a.succeeded?a.value:void 0}function we(n,e,t,a){if(e&&!e(n))return!1;const r=Q(n,t);return r?a(r):!1}function ye(n,e){var t;return At((t=n==null?void 0:n())!==null&&t!==void 0?t:{},e)}function Rt(n){return"value"in n}function Di(n){if(!Ya(n)||!("binding"in n))return!1;const e=n.binding;return $a(e)}const Le="http://www.w3.org/2000/svg";function ta(n){n.offsetHeight}function Pc(n,e){const t=n.style.transition;n.style.transition="none",e(),n.style.transition=t}function tr(n){return n.ontouchstart!==void 0}function Fc(){return globalThis}function kc(){return Fc().document}function Nc(n){const e=n.ownerDocument.defaultView;return e&&"document"in e?n.getContext("2d",{willReadFrequently:!0}):null}const jc={check:'<path d="M2 8l4 4l8 -8"/>',dropdown:'<path d="M5 7h6l-3 3 z"/>',p2dpad:'<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>'};function ha(n,e){const t=n.createElementNS(Le,"svg");return t.innerHTML=jc[e],t}function Mi(n,e,t){n.insertBefore(e,n.children[t])}function nr(n){n.parentElement&&n.parentElement.removeChild(n)}function Pi(n){for(;n.children.length>0;)n.removeChild(n.children[0])}function Bc(n){for(;n.childNodes.length>0;)n.removeChild(n.childNodes[0])}function Fi(n){return n.relatedTarget?n.relatedTarget:"explicitOriginalTarget"in n?n.explicitOriginalTarget:null}function lt(n,e){n.emitter.on("change",t=>{e(t.rawValue)}),e(n.rawValue)}function We(n,e,t){lt(n.value(e),t)}const Oc="tp";function U(n){return(t,a)=>[Oc,"-",n,"v",t?`_${t}`:"",a?`-${a}`:""].join("")}const sn=U("lbl");function Vc(n,e){const t=n.createDocumentFragment();return e.split(`
`).map(r=>n.createTextNode(r)).forEach((r,s)=>{s>0&&t.appendChild(n.createElement("br")),t.appendChild(r)}),t}class ki{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(sn()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("div");a.classList.add(sn("l")),We(t.props,"label",s=>{q(s)?this.element.classList.add(sn(void 0,"nol")):(this.element.classList.remove(sn(void 0,"nol")),Bc(a),a.appendChild(Vc(e,s)))}),this.element.appendChild(a),this.labelElement=a;const r=e.createElement("div");r.classList.add(sn("v")),this.element.appendChild(r),this.valueElement=r}}class Ni{constructor(e,t){this.props=t.props,this.valueController=t.valueController,this.viewProps=t.valueController.viewProps,this.view=new ki(e,{props:t.props,viewProps:this.viewProps}),this.view.valueElement.appendChild(this.valueController.view.element)}importProps(e){return we(e,null,t=>({label:t.optional.string}),t=>(this.props.set("label",t.label),!0))}exportProps(){return ye(null,{label:this.props.get("label")})}}function Lc(){return["veryfirst","first","last","verylast"]}const bs=U(""),ms={veryfirst:"vfst",first:"fst",last:"lst",verylast:"vlst"};class fa{constructor(e){this.parent_=null,this.blade=e.blade,this.view=e.view,this.viewProps=e.viewProps;const t=this.view.element;this.blade.value("positions").emitter.on("change",()=>{Lc().forEach(a=>{t.classList.remove(bs(void 0,ms[a]))}),this.blade.get("positions").forEach(a=>{t.classList.add(bs(void 0,ms[a]))})}),this.viewProps.handleDispose(()=>{nr(t)})}get parent(){return this.parent_}set parent(e){this.parent_=e,this.viewProps.set("parent",this.parent_?this.parent_.viewProps:null)}importState(e){return we(e,null,t=>({disabled:t.required.boolean,hidden:t.required.boolean}),t=>(this.viewProps.importState(t),!0))}exportState(){return ye(null,Object.assign({},this.viewProps.exportState()))}}class Dt extends fa{constructor(e,t){if(t.value!==t.valueController.value)throw te.shouldNeverHappen();const a=t.valueController.viewProps,r=new Ni(e,{blade:t.blade,props:t.props,valueController:t.valueController});super(Object.assign(Object.assign({},t),{view:new ki(e,{props:t.props,viewProps:a}),viewProps:a})),this.labelController=r,this.value=t.value,this.valueController=t.valueController,this.view.valueElement.appendChild(this.valueController.view.element)}importState(e){return we(e,t=>{var a,r,s;return super.importState(t)&&this.labelController.importProps(t)&&((s=(r=(a=this.valueController).importProps)===null||r===void 0?void 0:r.call(a,e))!==null&&s!==void 0?s:!0)},t=>({value:t.optional.raw}),t=>(t.value&&(this.value.rawValue=t.value),!0))}exportState(){var e,t,a;return ye(()=>super.exportState(),Object.assign(Object.assign({value:this.value.rawValue},this.labelController.exportProps()),(a=(t=(e=this.valueController).exportProps)===null||t===void 0?void 0:t.call(e))!==null&&a!==void 0?a:{}))}}function gs(n){const e=Object.assign({},n);return delete e.value,e}class ji extends Dt{constructor(e,t){super(e,t),this.tag=t.tag}importState(e){return we(e,t=>super.importState(gs(e)),t=>({tag:t.optional.string}),t=>(this.tag=t.tag,!0))}exportState(){return ye(()=>gs(super.exportState()),{binding:{key:this.value.binding.target.key,value:this.value.binding.target.read()},tag:this.tag})}}function Uc(n){return Rt(n)&&Di(n.value)}class Gc extends ji{importState(e){return we(e,t=>super.importState(t),t=>({binding:t.required.object({value:t.required.raw})}),t=>(this.value.binding.inject(t.binding.value),this.value.fetch(),!0))}}function Wc(n){return Rt(n)&&Rc(n.value)}function Bi(n,e){for(;n.length<e;)n.push(void 0)}function zc(n){const e=[];return Bi(e,n),e}function Hc(n){const e=n.indexOf(void 0);return e<0?n:n.slice(0,e)}function Xc(n,e){const t=[...Hc(n),e];return t.length>n.length?t.splice(0,t.length-n.length):Bi(t,n.length),t}class Kc{constructor(e){this.emitter=new ae,this.onTick_=this.onTick_.bind(this),this.onValueBeforeChange_=this.onValueBeforeChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.binding=e.binding,this.value_=Y(zc(e.bufferSize)),this.value_.emitter.on("beforechange",this.onValueBeforeChange_),this.value_.emitter.on("change",this.onValueChange_),this.ticker=e.ticker,this.ticker.emitter.on("tick",this.onTick_),this.fetch()}get rawValue(){return this.value_.rawValue}set rawValue(e){this.value_.rawValue=e}setRawValue(e,t){this.value_.setRawValue(e,t)}fetch(){this.value_.rawValue=Xc(this.value_.rawValue,this.binding.read())}onTick_(){this.fetch()}onValueBeforeChange_(e){this.emitter.emit("beforechange",Object.assign(Object.assign({},e),{sender:this}))}onValueChange_(e){this.emitter.emit("change",Object.assign(Object.assign({},e),{sender:this}))}}function qc(n){if(!("binding"in n))return!1;const e=n.binding;return $a(e)&&"read"in e&&!("write"in e)}class Jc extends ji{exportState(){return ye(()=>super.exportState(),{binding:{readonly:!0}})}}function Yc(n){return Rt(n)&&qc(n.value)}class $c extends Ft{get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get title(){var e;return(e=this.controller.buttonController.props.get("title"))!==null&&e!==void 0?e:""}set title(e){this.controller.buttonController.props.set("title",e)}on(e,t){const a=t.bind(this);return this.controller.buttonController.emitter.on(e,s=>{a(new Cc(this,s.nativeEvent))}),this}off(e,t){return this.controller.buttonController.emitter.off(e,t),this}}function Qc(n,e,t){t?n.classList.add(e):n.classList.remove(e)}function Qt(n,e){return t=>{Qc(n,e,t)}}function ar(n,e){lt(n,t=>{e.textContent=t??""})}const va=U("btn");class Zc{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(va()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("button");a.classList.add(va("b")),t.viewProps.bindDisabled(a),this.element.appendChild(a),this.buttonElement=a;const r=e.createElement("div");r.classList.add(va("t")),ar(t.props.value("title"),r),this.buttonElement.appendChild(r)}}class eu{constructor(e,t){this.emitter=new ae,this.onClick_=this.onClick_.bind(this),this.props=t.props,this.viewProps=t.viewProps,this.view=new Zc(e,{props:this.props,viewProps:this.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}importProps(e){return we(e,null,t=>({title:t.optional.string}),t=>(this.props.set("title",t.title),!0))}exportProps(){return ye(null,{title:this.props.get("title")})}onClick_(e){this.emitter.emit("click",{nativeEvent:e,sender:this})}}class vs extends fa{constructor(e,t){const a=new eu(e,{props:t.buttonProps,viewProps:t.viewProps}),r=new Ni(e,{blade:t.blade,props:t.labelProps,valueController:a});super({blade:t.blade,view:r.view,viewProps:t.viewProps}),this.buttonController=a,this.labelController=r}importState(e){return we(e,t=>super.importState(t)&&this.buttonController.importProps(t)&&this.labelController.importProps(t),()=>({}),()=>!0)}exportState(){return ye(()=>super.exportState(),Object.assign(Object.assign({},this.buttonController.exportProps()),this.labelController.exportProps()))}}class Oi{constructor(e){const[t,a]=e.split("-"),r=t.split(".");this.major=parseInt(r[0],10),this.minor=parseInt(r[1],10),this.patch=parseInt(r[2],10),this.prerelease=a??null}toString(){const e=[this.major,this.minor,this.patch].join(".");return this.prerelease!==null?[e,this.prerelease].join("-"):e}}const Zt=new Oi("2.0.5");function be(n){return Object.assign({core:Zt},n)}const tu=be({id:"button",type:"blade",accept(n){const e=Q(n,t=>({title:t.required.string,view:t.required.constant("button"),label:t.optional.string}));return e?{params:e}:null},controller(n){return new vs(n.document,{blade:n.blade,buttonProps:V.fromObject({title:n.params.title}),labelProps:V.fromObject({label:n.params.label}),viewProps:n.viewProps})},api(n){return n.controller instanceof vs?new $c(n.controller):null}});function nu(n,e){return n.addBlade(Object.assign(Object.assign({},e),{view:"button"}))}function au(n,e){return n.addBlade(Object.assign(Object.assign({},e),{view:"folder"}))}function ru(n,e){return n.addBlade(Object.assign(Object.assign({},e),{view:"tab"}))}function su(n){return Ya(n)?"refresh"in n&&typeof n.refresh=="function":!1}function iu(n,e){if(!ea.isBindable(n))throw te.notBindable();return new ea(n,e)}class ou{constructor(e,t){this.onRackValueChange_=this.onRackValueChange_.bind(this),this.controller_=e,this.emitter_=new ae,this.pool_=t,this.controller_.rack.emitter.on("valuechange",this.onRackValueChange_)}get children(){return this.controller_.rack.children.map(e=>this.pool_.createApi(e))}addBinding(e,t,a){const r=a??{},s=this.controller_.element.ownerDocument,i=this.pool_.createBinding(s,iu(e,t),r),o=this.pool_.createBindingApi(i);return this.add(o,r.index)}addFolder(e){return au(this,e)}addButton(e){return nu(this,e)}addTab(e){return ru(this,e)}add(e,t){const a=e.controller;return this.controller_.rack.add(a,t),e}remove(e){this.controller_.rack.remove(e.controller)}addBlade(e){const t=this.controller_.element.ownerDocument,a=this.pool_.createBlade(t,e),r=this.pool_.createApi(a);return this.add(r,e.index)}on(e,t){const a=t.bind(this);return this.emitter_.on(e,r=>{a(r)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}refresh(){this.children.forEach(e=>{su(e)&&e.refresh()})}onRackValueChange_(e){const t=e.bladeController,a=this.pool_.createApi(t),r=Di(t.value)?t.value.binding:null;this.emitter_.emit("change",new Dn(a,r?r.target.read():t.value.rawValue,e.options.last))}}class rr extends Ft{constructor(e,t){super(e),this.rackApi_=new ou(e.rackController,t)}refresh(){this.rackApi_.refresh()}}class sr extends fa{constructor(e){super({blade:e.blade,view:e.view,viewProps:e.rackController.viewProps}),this.rackController=e.rackController}importState(e){return we(e,t=>super.importState(t),t=>({children:t.required.array(t.required.raw)}),t=>this.rackController.rack.children.every((a,r)=>a.importState(t.children[r])))}exportState(){return ye(()=>super.exportState(),{children:this.rackController.rack.children.map(e=>e.exportState())})}}function Na(n){return"rackController"in n}class lu{constructor(e){this.emitter=new ae,this.items_=[],this.cache_=new Set,this.onSubListAdd_=this.onSubListAdd_.bind(this),this.onSubListRemove_=this.onSubListRemove_.bind(this),this.extract_=e}get items(){return this.items_}allItems(){return Array.from(this.cache_)}find(e){for(const t of this.allItems())if(e(t))return t;return null}includes(e){return this.cache_.has(e)}add(e,t){if(this.includes(e))throw te.shouldNeverHappen();const a=t!==void 0?t:this.items_.length;this.items_.splice(a,0,e),this.cache_.add(e);const r=this.extract_(e);r&&(r.emitter.on("add",this.onSubListAdd_),r.emitter.on("remove",this.onSubListRemove_),r.allItems().forEach(s=>{this.cache_.add(s)})),this.emitter.emit("add",{index:a,item:e,root:this,target:this})}remove(e){const t=this.items_.indexOf(e);if(t<0)return;this.items_.splice(t,1),this.cache_.delete(e);const a=this.extract_(e);a&&(a.allItems().forEach(r=>{this.cache_.delete(r)}),a.emitter.off("add",this.onSubListAdd_),a.emitter.off("remove",this.onSubListRemove_)),this.emitter.emit("remove",{index:t,item:e,root:this,target:this})}onSubListAdd_(e){this.cache_.add(e.item),this.emitter.emit("add",{index:e.index,item:e.item,root:this,target:e.target})}onSubListRemove_(e){this.cache_.delete(e.item),this.emitter.emit("remove",{index:e.index,item:e.item,root:this,target:e.target})}}function cu(n,e){for(let t=0;t<n.length;t++){const a=n[t];if(Rt(a)&&a.value===e)return a}return null}function uu(n){return Na(n)?n.rackController.rack.bcSet_:null}class _u{constructor(e){var t,a;this.emitter=new ae,this.onBladePositionsChange_=this.onBladePositionsChange_.bind(this),this.onSetAdd_=this.onSetAdd_.bind(this),this.onSetRemove_=this.onSetRemove_.bind(this),this.onChildDispose_=this.onChildDispose_.bind(this),this.onChildPositionsChange_=this.onChildPositionsChange_.bind(this),this.onChildValueChange_=this.onChildValueChange_.bind(this),this.onChildViewPropsChange_=this.onChildViewPropsChange_.bind(this),this.onRackLayout_=this.onRackLayout_.bind(this),this.onRackValueChange_=this.onRackValueChange_.bind(this),this.blade_=(t=e.blade)!==null&&t!==void 0?t:null,(a=this.blade_)===null||a===void 0||a.value("positions").emitter.on("change",this.onBladePositionsChange_),this.viewProps=e.viewProps,this.bcSet_=new lu(uu),this.bcSet_.emitter.on("add",this.onSetAdd_),this.bcSet_.emitter.on("remove",this.onSetRemove_)}get children(){return this.bcSet_.items}add(e,t){var a;(a=e.parent)===null||a===void 0||a.remove(e),e.parent=this,this.bcSet_.add(e,t)}remove(e){e.parent=null,this.bcSet_.remove(e)}find(e){return this.bcSet_.allItems().filter(e)}onSetAdd_(e){this.updatePositions_();const t=e.target===e.root;if(this.emitter.emit("add",{bladeController:e.item,index:e.index,root:t,sender:this}),!t)return;const a=e.item;if(a.viewProps.emitter.on("change",this.onChildViewPropsChange_),a.blade.value("positions").emitter.on("change",this.onChildPositionsChange_),a.viewProps.handleDispose(this.onChildDispose_),Rt(a))a.value.emitter.on("change",this.onChildValueChange_);else if(Na(a)){const r=a.rackController.rack;if(r){const s=r.emitter;s.on("layout",this.onRackLayout_),s.on("valuechange",this.onRackValueChange_)}}}onSetRemove_(e){this.updatePositions_();const t=e.target===e.root;if(this.emitter.emit("remove",{bladeController:e.item,root:t,sender:this}),!t)return;const a=e.item;if(Rt(a))a.value.emitter.off("change",this.onChildValueChange_);else if(Na(a)){const r=a.rackController.rack;if(r){const s=r.emitter;s.off("layout",this.onRackLayout_),s.off("valuechange",this.onRackValueChange_)}}}updatePositions_(){const e=this.bcSet_.items.filter(r=>!r.viewProps.get("hidden")),t=e[0],a=e[e.length-1];this.bcSet_.items.forEach(r=>{const s=[];r===t&&(s.push("first"),(!this.blade_||this.blade_.get("positions").includes("veryfirst"))&&s.push("veryfirst")),r===a&&(s.push("last"),(!this.blade_||this.blade_.get("positions").includes("verylast"))&&s.push("verylast")),r.blade.set("positions",s)})}onChildPositionsChange_(){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildViewPropsChange_(e){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildDispose_(){this.bcSet_.items.filter(t=>t.viewProps.get("disposed")).forEach(t=>{this.bcSet_.remove(t)})}onChildValueChange_(e){const t=cu(this.find(Rt),e.sender);if(!t)throw te.alreadyDisposed();this.emitter.emit("valuechange",{bladeController:t,options:e.options,sender:this})}onRackLayout_(e){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onRackValueChange_(e){this.emitter.emit("valuechange",{bladeController:e.bladeController,options:e.options,sender:this})}onBladePositionsChange_(){this.updatePositions_()}}class ir{constructor(e){this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this),this.element=e.element,this.viewProps=e.viewProps;const t=new _u({blade:e.root?void 0:e.blade,viewProps:e.viewProps});t.emitter.on("add",this.onRackAdd_),t.emitter.on("remove",this.onRackRemove_),this.rack=t,this.viewProps.handleDispose(()=>{for(let a=this.rack.children.length-1;a>=0;a--)this.rack.children[a].viewProps.set("disposed",!0)})}onRackAdd_(e){e.root&&Mi(this.element,e.bladeController.view.element,e.index)}onRackRemove_(e){e.root&&nr(e.bladeController.view.element)}}function en(){return new V({positions:Y([],{equals:Gl})})}class Mn extends V{constructor(e){super(e)}static create(e){const t={completed:!0,expanded:e,expandedHeight:null,shouldFixHeight:!1,temporaryExpanded:null},a=V.createCore(t);return new Mn(a)}get styleExpanded(){var e;return(e=this.get("temporaryExpanded"))!==null&&e!==void 0?e:this.get("expanded")}get styleHeight(){if(!this.styleExpanded)return"0";const e=this.get("expandedHeight");return this.get("shouldFixHeight")&&!q(e)?`${e}px`:"auto"}bindExpandedClass(e,t){const a=()=>{this.styleExpanded?e.classList.add(t):e.classList.remove(t)};We(this,"expanded",a),We(this,"temporaryExpanded",a)}cleanUpTransition(){this.set("shouldFixHeight",!1),this.set("expandedHeight",null),this.set("completed",!0)}}function du(n,e){let t=0;return Pc(e,()=>{n.set("expandedHeight",null),n.set("temporaryExpanded",!0),ta(e),t=e.clientHeight,n.set("temporaryExpanded",null),ta(e)}),t}function xs(n,e){e.style.height=n.styleHeight}function or(n,e){n.value("expanded").emitter.on("beforechange",()=>{if(n.set("completed",!1),q(n.get("expandedHeight"))){const t=du(n,e);t>0&&n.set("expandedHeight",t)}n.set("shouldFixHeight",!0),ta(e)}),n.emitter.on("change",()=>{xs(n,e)}),xs(n,e),e.addEventListener("transitionend",t=>{t.propertyName==="height"&&n.cleanUpTransition()})}class Vi extends rr{constructor(e,t){super(e,t),this.emitter_=new ae,this.controller.foldable.value("expanded").emitter.on("change",a=>{this.emitter_.emit("fold",new yc(this,a.sender.rawValue))}),this.rackApi_.on("change",a=>{this.emitter_.emit("change",a)})}get expanded(){return this.controller.foldable.get("expanded")}set expanded(e){this.controller.foldable.set("expanded",e)}get title(){return this.controller.props.get("title")}set title(e){this.controller.props.set("title",e)}get children(){return this.rackApi_.children}addBinding(e,t,a){return this.rackApi_.addBinding(e,t,a)}addFolder(e){return this.rackApi_.addFolder(e)}addButton(e){return this.rackApi_.addButton(e)}addTab(e){return this.rackApi_.addTab(e)}add(e,t){return this.rackApi_.add(e,t)}remove(e){this.rackApi_.remove(e)}addBlade(e){return this.rackApi_.addBlade(e)}on(e,t){const a=t.bind(this);return this.emitter_.on(e,r=>{a(r)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}const Li=U("cnt");class hu{constructor(e,t){var a;this.className_=U((a=t.viewName)!==null&&a!==void 0?a:"fld"),this.element=e.createElement("div"),this.element.classList.add(this.className_(),Li()),t.viewProps.bindClassModifiers(this.element),this.foldable_=t.foldable,this.foldable_.bindExpandedClass(this.element,this.className_(void 0,"expanded")),We(this.foldable_,"completed",Qt(this.element,this.className_(void 0,"cpl")));const r=e.createElement("button");r.classList.add(this.className_("b")),We(t.props,"title",c=>{q(c)?this.element.classList.add(this.className_(void 0,"not")):this.element.classList.remove(this.className_(void 0,"not"))}),t.viewProps.bindDisabled(r),this.element.appendChild(r),this.buttonElement=r;const s=e.createElement("div");s.classList.add(this.className_("i")),this.element.appendChild(s);const i=e.createElement("div");i.classList.add(this.className_("t")),ar(t.props.value("title"),i),this.buttonElement.appendChild(i),this.titleElement=i;const o=e.createElement("div");o.classList.add(this.className_("m")),this.buttonElement.appendChild(o);const l=e.createElement("div");l.classList.add(this.className_("c")),this.element.appendChild(l),this.containerElement=l}}class ja extends sr{constructor(e,t){var a;const r=Mn.create((a=t.expanded)!==null&&a!==void 0?a:!0),s=new hu(e,{foldable:r,props:t.props,viewName:t.root?"rot":void 0,viewProps:t.viewProps});super(Object.assign(Object.assign({},t),{rackController:new ir({blade:t.blade,element:s.containerElement,root:t.root,viewProps:t.viewProps}),view:s})),this.onTitleClick_=this.onTitleClick_.bind(this),this.props=t.props,this.foldable=r,or(this.foldable,this.view.containerElement),this.rackController.rack.emitter.on("add",()=>{this.foldable.cleanUpTransition()}),this.rackController.rack.emitter.on("remove",()=>{this.foldable.cleanUpTransition()}),this.view.buttonElement.addEventListener("click",this.onTitleClick_)}get document(){return this.view.element.ownerDocument}importState(e){return we(e,t=>super.importState(t),t=>({expanded:t.required.boolean,title:t.optional.string}),t=>(this.foldable.set("expanded",t.expanded),this.props.set("title",t.title),!0))}exportState(){return ye(()=>super.exportState(),{expanded:this.foldable.get("expanded"),title:this.props.get("title")})}onTitleClick_(){this.foldable.set("expanded",!this.foldable.get("expanded"))}}const fu=be({id:"folder",type:"blade",accept(n){const e=Q(n,t=>({title:t.required.string,view:t.required.constant("folder"),expanded:t.optional.boolean}));return e?{params:e}:null},controller(n){return new ja(n.document,{blade:n.blade,expanded:n.params.expanded,props:V.fromObject({title:n.params.title}),viewProps:n.viewProps})},api(n){return n.controller instanceof ja?new Vi(n.controller,n.pool):null}}),pu=U("");function Ss(n,e){return Qt(n,pu(void 0,e))}class dt extends V{constructor(e){var t;super(e),this.onDisabledChange_=this.onDisabledChange_.bind(this),this.onParentChange_=this.onParentChange_.bind(this),this.onParentGlobalDisabledChange_=this.onParentGlobalDisabledChange_.bind(this),[this.globalDisabled_,this.setGlobalDisabled_]=Kl(Y(this.getGlobalDisabled_())),this.value("disabled").emitter.on("change",this.onDisabledChange_),this.value("parent").emitter.on("change",this.onParentChange_),(t=this.get("parent"))===null||t===void 0||t.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_)}static create(e){var t,a,r;const s=e??{};return new dt(V.createCore({disabled:(t=s.disabled)!==null&&t!==void 0?t:!1,disposed:!1,hidden:(a=s.hidden)!==null&&a!==void 0?a:!1,parent:(r=s.parent)!==null&&r!==void 0?r:null}))}get globalDisabled(){return this.globalDisabled_}bindClassModifiers(e){lt(this.globalDisabled_,Ss(e,"disabled")),We(this,"hidden",Ss(e,"hidden"))}bindDisabled(e){lt(this.globalDisabled_,t=>{e.disabled=t})}bindTabIndex(e){lt(this.globalDisabled_,t=>{e.tabIndex=t?-1:0})}handleDispose(e){this.value("disposed").emitter.on("change",t=>{t&&e()})}importState(e){this.set("disabled",e.disabled),this.set("hidden",e.hidden)}exportState(){return{disabled:this.get("disabled"),hidden:this.get("hidden")}}getGlobalDisabled_(){const e=this.get("parent");return(e?e.globalDisabled.rawValue:!1)||this.get("disabled")}updateGlobalDisabled_(){this.setGlobalDisabled_(this.getGlobalDisabled_())}onDisabledChange_(){this.updateGlobalDisabled_()}onParentGlobalDisabledChange_(){this.updateGlobalDisabled_()}onParentChange_(e){var t;const a=e.previousRawValue;a==null||a.globalDisabled.emitter.off("change",this.onParentGlobalDisabledChange_),(t=this.get("parent"))===null||t===void 0||t.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_),this.updateGlobalDisabled_()}}const Ts=U("tbp");class bu{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(Ts()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("div");a.classList.add(Ts("c")),this.element.appendChild(a),this.containerElement=a}}const on=U("tbi");class mu{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(on()),t.viewProps.bindClassModifiers(this.element),We(t.props,"selected",s=>{s?this.element.classList.add(on(void 0,"sel")):this.element.classList.remove(on(void 0,"sel"))});const a=e.createElement("button");a.classList.add(on("b")),t.viewProps.bindDisabled(a),this.element.appendChild(a),this.buttonElement=a;const r=e.createElement("div");r.classList.add(on("t")),ar(t.props.value("title"),r),this.buttonElement.appendChild(r),this.titleElement=r}}class gu{constructor(e,t){this.emitter=new ae,this.onClick_=this.onClick_.bind(this),this.props=t.props,this.viewProps=t.viewProps,this.view=new mu(e,{props:t.props,viewProps:t.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}onClick_(){this.emitter.emit("click",{sender:this})}}class Ba extends sr{constructor(e,t){const a=new bu(e,{viewProps:t.viewProps});super(Object.assign(Object.assign({},t),{rackController:new ir({blade:t.blade,element:a.containerElement,viewProps:t.viewProps}),view:a})),this.onItemClick_=this.onItemClick_.bind(this),this.ic_=new gu(e,{props:t.itemProps,viewProps:dt.create()}),this.ic_.emitter.on("click",this.onItemClick_),this.props=t.props,We(this.props,"selected",r=>{this.itemController.props.set("selected",r),this.viewProps.set("hidden",!r)})}get itemController(){return this.ic_}importState(e){return we(e,t=>super.importState(t),t=>({selected:t.required.boolean,title:t.required.string}),t=>(this.ic_.props.set("selected",t.selected),this.ic_.props.set("title",t.title),!0))}exportState(){return ye(()=>super.exportState(),{selected:this.ic_.props.get("selected"),title:this.ic_.props.get("title")})}onItemClick_(){this.props.set("selected",!0)}}class vu extends rr{constructor(e,t){super(e,t),this.emitter_=new ae,this.onSelect_=this.onSelect_.bind(this),this.pool_=t,this.rackApi_.on("change",a=>{this.emitter_.emit("change",a)}),this.controller.tab.selectedIndex.emitter.on("change",this.onSelect_)}get pages(){return this.rackApi_.children}addPage(e){const t=this.controller.view.element.ownerDocument,a=new Ba(t,{blade:en(),itemProps:V.fromObject({selected:!1,title:e.title}),props:V.fromObject({selected:!1}),viewProps:dt.create()}),r=this.pool_.createApi(a);return this.rackApi_.add(r,e.index)}removePage(e){this.rackApi_.remove(this.rackApi_.children[e])}on(e,t){const a=t.bind(this);return this.emitter_.on(e,r=>{a(r)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}onSelect_(e){this.emitter_.emit("select",new Ec(this,e.rawValue))}}class xu extends rr{get title(){var e;return(e=this.controller.itemController.props.get("title"))!==null&&e!==void 0?e:""}set title(e){this.controller.itemController.props.set("title",e)}get selected(){return this.controller.props.get("selected")}set selected(e){this.controller.props.set("selected",e)}get children(){return this.rackApi_.children}addButton(e){return this.rackApi_.addButton(e)}addFolder(e){return this.rackApi_.addFolder(e)}addTab(e){return this.rackApi_.addTab(e)}add(e,t){this.rackApi_.add(e,t)}remove(e){this.rackApi_.remove(e)}addBinding(e,t,a){return this.rackApi_.addBinding(e,t,a)}addBlade(e){return this.rackApi_.addBlade(e)}}const ws=-1;class Su{constructor(){this.onItemSelectedChange_=this.onItemSelectedChange_.bind(this),this.empty=Y(!0),this.selectedIndex=Y(ws),this.items_=[]}add(e,t){const a=t??this.items_.length;this.items_.splice(a,0,e),e.emitter.on("change",this.onItemSelectedChange_),this.keepSelection_()}remove(e){const t=this.items_.indexOf(e);t<0||(this.items_.splice(t,1),e.emitter.off("change",this.onItemSelectedChange_),this.keepSelection_())}keepSelection_(){if(this.items_.length===0){this.selectedIndex.rawValue=ws,this.empty.rawValue=!0;return}const e=this.items_.findIndex(t=>t.rawValue);e<0?(this.items_.forEach((t,a)=>{t.rawValue=a===0}),this.selectedIndex.rawValue=0):(this.items_.forEach((t,a)=>{t.rawValue=a===e}),this.selectedIndex.rawValue=e),this.empty.rawValue=!1}onItemSelectedChange_(e){if(e.rawValue){const t=this.items_.findIndex(a=>a===e.sender);this.items_.forEach((a,r)=>{a.rawValue=r===t}),this.selectedIndex.rawValue=t}else this.keepSelection_()}}const ln=U("tab");class Tu{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(ln(),Li()),t.viewProps.bindClassModifiers(this.element),lt(t.empty,Qt(this.element,ln(void 0,"nop")));const a=e.createElement("div");a.classList.add(ln("t")),this.element.appendChild(a),this.itemsElement=a;const r=e.createElement("div");r.classList.add(ln("i")),this.element.appendChild(r);const s=e.createElement("div");s.classList.add(ln("c")),this.element.appendChild(s),this.contentsElement=s}}class ys extends sr{constructor(e,t){const a=new Su,r=new Tu(e,{empty:a.empty,viewProps:t.viewProps});super({blade:t.blade,rackController:new ir({blade:t.blade,element:r.contentsElement,viewProps:t.viewProps}),view:r}),this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this);const s=this.rackController.rack;s.emitter.on("add",this.onRackAdd_),s.emitter.on("remove",this.onRackRemove_),this.tab=a}add(e,t){this.rackController.rack.add(e,t)}remove(e){this.rackController.rack.remove(this.rackController.rack.children[e])}onRackAdd_(e){if(!e.root)return;const t=e.bladeController;Mi(this.view.itemsElement,t.itemController.view.element,e.index),t.itemController.viewProps.set("parent",this.viewProps),this.tab.add(t.props.value("selected"))}onRackRemove_(e){if(!e.root)return;const t=e.bladeController;nr(t.itemController.view.element),t.itemController.viewProps.set("parent",null),this.tab.remove(t.props.value("selected"))}}const Ui=be({id:"tab",type:"blade",accept(n){const e=Q(n,t=>({pages:t.required.array(t.required.object({title:t.required.string})),view:t.required.constant("tab")}));return!e||e.pages.length===0?null:{params:e}},controller(n){const e=new ys(n.document,{blade:n.blade,viewProps:n.viewProps});return n.params.pages.forEach(t=>{const a=new Ba(n.document,{blade:en(),itemProps:V.fromObject({selected:!1,title:t.title}),props:V.fromObject({selected:!1}),viewProps:dt.create()});e.add(a)}),e},api(n){return n.controller instanceof ys?new vu(n.controller,n.pool):n.controller instanceof Ba?new xu(n.controller,n.pool):null}});function wu(n,e){const t=n.accept(e.params);if(!t)return null;const a=Q(e.params,r=>({disabled:r.optional.boolean,hidden:r.optional.boolean}));return n.controller({blade:en(),document:e.document,params:Object.assign(Object.assign({},t.params),{disabled:a==null?void 0:a.disabled,hidden:a==null?void 0:a.hidden}),viewProps:dt.create({disabled:a==null?void 0:a.disabled,hidden:a==null?void 0:a.hidden})})}class lr extends xn{get options(){return this.controller.valueController.props.get("options")}set options(e){this.controller.valueController.props.set("options",e)}}class yu{constructor(){this.disabled=!1,this.emitter=new ae}dispose(){}tick(){this.disabled||this.emitter.emit("tick",{sender:this})}}class Eu{constructor(e,t){this.disabled_=!1,this.timerId_=null,this.onTick_=this.onTick_.bind(this),this.doc_=e,this.emitter=new ae,this.interval_=t,this.setTimer_()}get disabled(){return this.disabled_}set disabled(e){this.disabled_=e,this.disabled_?this.clearTimer_():this.setTimer_()}dispose(){this.clearTimer_()}clearTimer_(){if(this.timerId_===null)return;const e=this.doc_.defaultView;e&&e.clearInterval(this.timerId_),this.timerId_=null}setTimer_(){if(this.clearTimer_(),this.interval_<=0)return;const e=this.doc_.defaultView;e&&(this.timerId_=e.setInterval(this.onTick_,this.interval_))}onTick_(){this.disabled_||this.emitter.emit("tick",{sender:this})}}class Pn{constructor(e){this.constraints=e}constrain(e){return this.constraints.reduce((t,a)=>a.constrain(t),e)}}function na(n,e){if(n instanceof e)return n;if(n instanceof Pn){const t=n.constraints.reduce((a,r)=>a||(r instanceof e?r:null),null);if(t)return t}return null}class Fn{constructor(e){this.values=V.fromObject({options:e})}constrain(e){const t=this.values.get("options");return t.length===0||t.filter(r=>r.value===e).length>0?e:t[0].value}}function kn(n){var e;const t=ka;if(Array.isArray(n))return(e=Q({items:n},a=>({items:a.required.array(a.required.object({text:a.required.string,value:a.required.raw}))})))===null||e===void 0?void 0:e.items;if(typeof n=="object")return t.required.raw(n).value}function cr(n){if(Array.isArray(n))return n;const e=[];return Object.keys(n).forEach(t=>{e.push({text:t,value:n[t]})}),e}function ur(n){return q(n)?null:new Fn(cr(n))}const xa=U("lst");class Cu{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.props_=t.props,this.element=e.createElement("div"),this.element.classList.add(xa()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("select");a.classList.add(xa("s")),t.viewProps.bindDisabled(a),this.element.appendChild(a),this.selectElement=a;const r=e.createElement("div");r.classList.add(xa("m")),r.appendChild(ha(e,"dropdown")),this.element.appendChild(r),t.value.emitter.on("change",this.onValueChange_),this.value_=t.value,We(this.props_,"options",s=>{Pi(this.selectElement),s.forEach(i=>{const o=e.createElement("option");o.textContent=i.text,this.selectElement.appendChild(o)}),this.update_()})}update_(){const e=this.props_.get("options").map(t=>t.value);this.selectElement.selectedIndex=e.indexOf(this.value_.rawValue)}onValueChange_(){this.update_()}}class Tt{constructor(e,t){this.onSelectChange_=this.onSelectChange_.bind(this),this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.view=new Cu(e,{props:this.props,value:this.value,viewProps:this.viewProps}),this.view.selectElement.addEventListener("change",this.onSelectChange_)}onSelectChange_(e){const t=e.currentTarget;this.value.rawValue=this.props.get("options")[t.selectedIndex].value}importProps(e){return we(e,null,t=>({options:t.required.custom(kn)}),t=>(this.props.set("options",cr(t.options)),!0))}exportProps(){return ye(null,{options:this.props.get("options")})}}const Es=U("pop");class Iu{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(Es()),t.viewProps.bindClassModifiers(this.element),lt(t.shows,Qt(this.element,Es(void 0,"v")))}}class Gi{constructor(e,t){this.shows=Y(!1),this.viewProps=t.viewProps,this.view=new Iu(e,{shows:this.shows,viewProps:this.viewProps})}}const Cs=U("txt");class Ru{constructor(e,t){this.onChange_=this.onChange_.bind(this),this.element=e.createElement("div"),this.element.classList.add(Cs()),t.viewProps.bindClassModifiers(this.element),this.props_=t.props,this.props_.emitter.on("change",this.onChange_);const a=e.createElement("input");a.classList.add(Cs("i")),a.type="text",t.viewProps.bindDisabled(a),this.element.appendChild(a),this.inputElement=a,t.value.emitter.on("change",this.onChange_),this.value_=t.value,this.refresh()}refresh(){const e=this.props_.get("formatter");this.inputElement.value=e(this.value_.rawValue)}onChange_(){this.refresh()}}class Sn{constructor(e,t){this.onInputChange_=this.onInputChange_.bind(this),this.parser_=t.parser,this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.view=new Ru(e,{props:t.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_)}onInputChange_(e){const a=e.currentTarget.value,r=this.parser_(a);q(r)||(this.value.rawValue=r),this.view.refresh()}}function Au(n){return String(n)}function Wi(n){return n==="false"?!1:!!n}function Is(n){return Au(n)}function Du(n){return e=>n.reduce((t,a)=>t!==null?t:a(e),null)}const Mu=xe(0);function aa(n){return Mu(n)+"%"}function zi(n){return String(n)}function Oa(n){return n}function tn({primary:n,secondary:e,forward:t,backward:a}){let r=!1;function s(i){r||(r=!0,i(),r=!1)}n.emitter.on("change",i=>{s(()=>{e.setRawValue(t(n.rawValue,e.rawValue),i.options)})}),e.emitter.on("change",i=>{s(()=>{n.setRawValue(a(n.rawValue,e.rawValue),i.options)}),s(()=>{e.setRawValue(t(n.rawValue,e.rawValue),i.options)})}),s(()=>{e.setRawValue(t(n.rawValue,e.rawValue),{forceEmit:!1,last:!0})})}function ve(n,e){const t=n*(e.altKey?.1:1)*(e.shiftKey?10:1);return e.upKey?+t:e.downKey?-t:0}function Tn(n){return{altKey:n.altKey,downKey:n.key==="ArrowDown",shiftKey:n.shiftKey,upKey:n.key==="ArrowUp"}}function _t(n){return{altKey:n.altKey,downKey:n.key==="ArrowLeft",shiftKey:n.shiftKey,upKey:n.key==="ArrowRight"}}function Pu(n){return n==="ArrowUp"||n==="ArrowDown"}function Hi(n){return Pu(n)||n==="ArrowLeft"||n==="ArrowRight"}function Sa(n,e){var t,a;const r=e.ownerDocument.defaultView,s=e.getBoundingClientRect();return{x:n.pageX-(((t=r&&r.scrollX)!==null&&t!==void 0?t:0)+s.left),y:n.pageY-(((a=r&&r.scrollY)!==null&&a!==void 0?a:0)+s.top)}}class kt{constructor(e){this.lastTouch_=null,this.onDocumentMouseMove_=this.onDocumentMouseMove_.bind(this),this.onDocumentMouseUp_=this.onDocumentMouseUp_.bind(this),this.onMouseDown_=this.onMouseDown_.bind(this),this.onTouchEnd_=this.onTouchEnd_.bind(this),this.onTouchMove_=this.onTouchMove_.bind(this),this.onTouchStart_=this.onTouchStart_.bind(this),this.elem_=e,this.emitter=new ae,e.addEventListener("touchstart",this.onTouchStart_,{passive:!1}),e.addEventListener("touchmove",this.onTouchMove_,{passive:!0}),e.addEventListener("touchend",this.onTouchEnd_),e.addEventListener("mousedown",this.onMouseDown_)}computePosition_(e){const t=this.elem_.getBoundingClientRect();return{bounds:{width:t.width,height:t.height},point:e?{x:e.x,y:e.y}:null}}onMouseDown_(e){var t;e.preventDefault(),(t=e.currentTarget)===null||t===void 0||t.focus();const a=this.elem_.ownerDocument;a.addEventListener("mousemove",this.onDocumentMouseMove_),a.addEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("down",{altKey:e.altKey,data:this.computePosition_(Sa(e,this.elem_)),sender:this,shiftKey:e.shiftKey})}onDocumentMouseMove_(e){this.emitter.emit("move",{altKey:e.altKey,data:this.computePosition_(Sa(e,this.elem_)),sender:this,shiftKey:e.shiftKey})}onDocumentMouseUp_(e){const t=this.elem_.ownerDocument;t.removeEventListener("mousemove",this.onDocumentMouseMove_),t.removeEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("up",{altKey:e.altKey,data:this.computePosition_(Sa(e,this.elem_)),sender:this,shiftKey:e.shiftKey})}onTouchStart_(e){e.preventDefault();const t=e.targetTouches.item(0),a=this.elem_.getBoundingClientRect();this.emitter.emit("down",{altKey:e.altKey,data:this.computePosition_(t?{x:t.clientX-a.left,y:t.clientY-a.top}:void 0),sender:this,shiftKey:e.shiftKey}),this.lastTouch_=t}onTouchMove_(e){const t=e.targetTouches.item(0),a=this.elem_.getBoundingClientRect();this.emitter.emit("move",{altKey:e.altKey,data:this.computePosition_(t?{x:t.clientX-a.left,y:t.clientY-a.top}:void 0),sender:this,shiftKey:e.shiftKey}),this.lastTouch_=t}onTouchEnd_(e){var t;const a=(t=e.targetTouches.item(0))!==null&&t!==void 0?t:this.lastTouch_,r=this.elem_.getBoundingClientRect();this.emitter.emit("up",{altKey:e.altKey,data:this.computePosition_(a?{x:a.clientX-r.left,y:a.clientY-r.top}:void 0),sender:this,shiftKey:e.shiftKey})}}const Ee=U("txt");class Fu{constructor(e,t){this.onChange_=this.onChange_.bind(this),this.props_=t.props,this.props_.emitter.on("change",this.onChange_),this.element=e.createElement("div"),this.element.classList.add(Ee(),Ee(void 0,"num")),t.arrayPosition&&this.element.classList.add(Ee(void 0,t.arrayPosition)),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("input");a.classList.add(Ee("i")),a.type="text",t.viewProps.bindDisabled(a),this.element.appendChild(a),this.inputElement=a,this.onDraggingChange_=this.onDraggingChange_.bind(this),this.dragging_=t.dragging,this.dragging_.emitter.on("change",this.onDraggingChange_),this.element.classList.add(Ee()),this.inputElement.classList.add(Ee("i"));const r=e.createElement("div");r.classList.add(Ee("k")),this.element.appendChild(r),this.knobElement=r;const s=e.createElementNS(Le,"svg");s.classList.add(Ee("g")),this.knobElement.appendChild(s);const i=e.createElementNS(Le,"path");i.classList.add(Ee("gb")),s.appendChild(i),this.guideBodyElem_=i;const o=e.createElementNS(Le,"path");o.classList.add(Ee("gh")),s.appendChild(o),this.guideHeadElem_=o;const l=e.createElement("div");l.classList.add(U("tt")()),this.knobElement.appendChild(l),this.tooltipElem_=l,t.value.emitter.on("change",this.onChange_),this.value=t.value,this.refresh()}onDraggingChange_(e){if(e.rawValue===null){this.element.classList.remove(Ee(void 0,"drg"));return}this.element.classList.add(Ee(void 0,"drg"));const t=e.rawValue/this.props_.get("pointerScale"),a=t+(t>0?-1:t<0?1:0),r=se(-a,-4,4);this.guideHeadElem_.setAttributeNS(null,"d",[`M ${a+r},0 L${a},4 L${a+r},8`,`M ${t},-1 L${t},9`].join(" ")),this.guideBodyElem_.setAttributeNS(null,"d",`M 0,4 L${t},4`);const s=this.props_.get("formatter");this.tooltipElem_.textContent=s(this.value.rawValue),this.tooltipElem_.style.left=`${t}px`}refresh(){const e=this.props_.get("formatter");this.inputElement.value=e(this.value.rawValue)}onChange_(){this.refresh()}}class Nn{constructor(e,t){var a;this.originRawValue_=0,this.onInputChange_=this.onInputChange_.bind(this),this.onInputKeyDown_=this.onInputKeyDown_.bind(this),this.onInputKeyUp_=this.onInputKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.parser_=t.parser,this.props=t.props,this.sliderProps_=(a=t.sliderProps)!==null&&a!==void 0?a:null,this.value=t.value,this.viewProps=t.viewProps,this.dragging_=Y(null),this.view=new Fu(e,{arrayPosition:t.arrayPosition,dragging:this.dragging_,props:this.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_),this.view.inputElement.addEventListener("keydown",this.onInputKeyDown_),this.view.inputElement.addEventListener("keyup",this.onInputKeyUp_);const r=new kt(this.view.knobElement);r.emitter.on("down",this.onPointerDown_),r.emitter.on("move",this.onPointerMove_),r.emitter.on("up",this.onPointerUp_)}constrainValue_(e){var t,a;const r=(t=this.sliderProps_)===null||t===void 0?void 0:t.get("min"),s=(a=this.sliderProps_)===null||a===void 0?void 0:a.get("max");let i=e;return r!==void 0&&(i=Math.max(i,r)),s!==void 0&&(i=Math.min(i,s)),i}onInputChange_(e){const a=e.currentTarget.value,r=this.parser_(a);q(r)||(this.value.rawValue=this.constrainValue_(r)),this.view.refresh()}onInputKeyDown_(e){const t=ve(this.props.get("keyScale"),Tn(e));t!==0&&this.value.setRawValue(this.constrainValue_(this.value.rawValue+t),{forceEmit:!1,last:!1})}onInputKeyUp_(e){ve(this.props.get("keyScale"),Tn(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}onPointerDown_(){this.originRawValue_=this.value.rawValue,this.dragging_.rawValue=0}computeDraggingValue_(e){if(!e.point)return null;const t=e.point.x-e.bounds.width/2;return this.constrainValue_(this.originRawValue_+t*this.props.get("pointerScale"))}onPointerMove_(e){const t=this.computeDraggingValue_(e.data);t!==null&&(this.value.setRawValue(t,{forceEmit:!1,last:!1}),this.dragging_.rawValue=this.value.rawValue-this.originRawValue_)}onPointerUp_(e){const t=this.computeDraggingValue_(e.data);t!==null&&(this.value.setRawValue(t,{forceEmit:!0,last:!0}),this.dragging_.rawValue=null)}}const Ta=U("sld");class ku{constructor(e,t){this.onChange_=this.onChange_.bind(this),this.props_=t.props,this.props_.emitter.on("change",this.onChange_),this.element=e.createElement("div"),this.element.classList.add(Ta()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("div");a.classList.add(Ta("t")),t.viewProps.bindTabIndex(a),this.element.appendChild(a),this.trackElement=a;const r=e.createElement("div");r.classList.add(Ta("k")),this.trackElement.appendChild(r),this.knobElement=r,t.value.emitter.on("change",this.onChange_),this.value=t.value,this.update_()}update_(){const e=se(z(this.value.rawValue,this.props_.get("min"),this.props_.get("max"),0,100),0,100);this.knobElement.style.width=`${e}%`}onChange_(){this.update_()}}class Nu{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDownOrMove_=this.onPointerDownOrMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.props=t.props,this.view=new ku(e,{props:this.props,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new kt(this.view.trackElement),this.ptHandler_.emitter.on("down",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("move",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.trackElement.addEventListener("keydown",this.onKeyDown_),this.view.trackElement.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){e.point&&this.value.setRawValue(z(se(e.point.x,0,e.bounds.width),0,e.bounds.width,this.props.get("min"),this.props.get("max")),t)}onPointerDownOrMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){const t=ve(this.props.get("keyScale"),_t(e));t!==0&&this.value.setRawValue(this.value.rawValue+t,{forceEmit:!1,last:!1})}onKeyUp_(e){ve(this.props.get("keyScale"),_t(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const wa=U("sldtxt");class ju{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(wa());const a=e.createElement("div");a.classList.add(wa("s")),this.sliderView_=t.sliderView,a.appendChild(this.sliderView_.element),this.element.appendChild(a);const r=e.createElement("div");r.classList.add(wa("t")),this.textView_=t.textView,r.appendChild(this.textView_.element),this.element.appendChild(r)}}class ra{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.sliderC_=new Nu(e,{props:t.sliderProps,value:t.value,viewProps:this.viewProps}),this.textC_=new Nn(e,{parser:t.parser,props:t.textProps,sliderProps:t.sliderProps,value:t.value,viewProps:t.viewProps}),this.view=new ju(e,{sliderView:this.sliderC_.view,textView:this.textC_.view})}get sliderController(){return this.sliderC_}get textController(){return this.textC_}importProps(e){return we(e,null,t=>({max:t.required.number,min:t.required.number}),t=>{const a=this.sliderC_.props;return a.set("max",t.max),a.set("min",t.min),!0})}exportProps(){const e=this.sliderC_.props;return ye(null,{max:e.get("max"),min:e.get("min")})}}function Xi(n){return{sliderProps:new V({keyScale:n.keyScale,max:n.max,min:n.min}),textProps:new V({formatter:Y(n.formatter),keyScale:n.keyScale,pointerScale:Y(n.pointerScale)})}}const Bu={containerUnitSize:"cnt-usz"};function Ki(n){return`--${Bu[n]}`}function wn(n){return Ai(n)}function gt(n){if(Fa(n))return Q(n,wn)}function ot(n,e){if(!n)return;const t=[],a=Ci(n,e);a&&t.push(a);const r=Ii(n);return r&&t.push(r),new Pn(t)}function Ou(n){return n?n.major===Zt.major:!1}function qi(n){if(n==="inline"||n==="popup")return n}function jn(n,e){n.write(e)}const Wn=U("ckb");class Vu{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.element=e.createElement("div"),this.element.classList.add(Wn()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("label");a.classList.add(Wn("l")),this.element.appendChild(a),this.labelElement=a;const r=e.createElement("input");r.classList.add(Wn("i")),r.type="checkbox",this.labelElement.appendChild(r),this.inputElement=r,t.viewProps.bindDisabled(this.inputElement);const s=e.createElement("div");s.classList.add(Wn("w")),this.labelElement.appendChild(s);const i=ha(e,"check");s.appendChild(i),t.value.emitter.on("change",this.onValueChange_),this.value=t.value,this.update_()}update_(){this.inputElement.checked=this.value.rawValue}onValueChange_(){this.update_()}}class Lu{constructor(e,t){this.onInputChange_=this.onInputChange_.bind(this),this.onLabelMouseDown_=this.onLabelMouseDown_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new Vu(e,{value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_),this.view.labelElement.addEventListener("mousedown",this.onLabelMouseDown_)}onInputChange_(e){const t=e.currentTarget;this.value.rawValue=t.checked,e.preventDefault(),e.stopPropagation()}onLabelMouseDown_(e){e.preventDefault()}}function Uu(n){const e=[],t=ur(n.options);return t&&e.push(t),new Pn(e)}const Gu=be({id:"input-bool",type:"input",accept:(n,e)=>{if(typeof n!="boolean")return null;const t=Q(e,a=>({options:a.optional.custom(kn),readonly:a.optional.constant(!1)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>Wi,constraint:n=>Uu(n.params),writer:n=>jn},controller:n=>{const e=n.document,t=n.value,a=n.constraint,r=a&&na(a,Fn);return r?new Tt(e,{props:new V({options:r.values.value("options")}),value:t,viewProps:n.viewProps}):new Lu(e,{value:t,viewProps:n.viewProps})},api(n){return typeof n.controller.value.rawValue!="boolean"?null:n.controller.valueController instanceof Tt?new lr(n.controller):null}}),Et=U("col");class Wu{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(Et()),t.foldable.bindExpandedClass(this.element,Et(void 0,"expanded")),We(t.foldable,"completed",Qt(this.element,Et(void 0,"cpl")));const a=e.createElement("div");a.classList.add(Et("h")),this.element.appendChild(a);const r=e.createElement("div");r.classList.add(Et("s")),a.appendChild(r),this.swatchElement=r;const s=e.createElement("div");if(s.classList.add(Et("t")),a.appendChild(s),this.textElement=s,t.pickerLayout==="inline"){const i=e.createElement("div");i.classList.add(Et("p")),this.element.appendChild(i),this.pickerElement=i}else this.pickerElement=null}}function zu(n,e,t){const a=se(n/255,0,1),r=se(e/255,0,1),s=se(t/255,0,1),i=Math.max(a,r,s),o=Math.min(a,r,s),l=i-o;let c=0,h=0;const d=(o+i)/2;return l!==0&&(h=l/(1-Math.abs(i+o-1)),a===i?c=(r-s)/l:r===i?c=2+(s-a)/l:c=4+(a-r)/l,c=c/6+(c<0?1:0)),[c*360,h*100,d*100]}function Hu(n,e,t){const a=(n%360+360)%360,r=se(e/100,0,1),s=se(t/100,0,1),i=(1-Math.abs(2*s-1))*r,o=i*(1-Math.abs(a/60%2-1)),l=s-i/2;let c,h,d;return a>=0&&a<60?[c,h,d]=[i,o,0]:a>=60&&a<120?[c,h,d]=[o,i,0]:a>=120&&a<180?[c,h,d]=[0,i,o]:a>=180&&a<240?[c,h,d]=[0,o,i]:a>=240&&a<300?[c,h,d]=[o,0,i]:[c,h,d]=[i,0,o],[(c+l)*255,(h+l)*255,(d+l)*255]}function Xu(n,e,t){const a=se(n/255,0,1),r=se(e/255,0,1),s=se(t/255,0,1),i=Math.max(a,r,s),o=Math.min(a,r,s),l=i-o;let c;l===0?c=0:i===a?c=60*(((r-s)/l%6+6)%6):i===r?c=60*((s-a)/l+2):c=60*((a-r)/l+4);const h=i===0?0:l/i,d=i;return[c,h*100,d*100]}function Ji(n,e,t){const a=wi(n,360),r=se(e/100,0,1),s=se(t/100,0,1),i=s*r,o=i*(1-Math.abs(a/60%2-1)),l=s-i;let c,h,d;return a>=0&&a<60?[c,h,d]=[i,o,0]:a>=60&&a<120?[c,h,d]=[o,i,0]:a>=120&&a<180?[c,h,d]=[0,i,o]:a>=180&&a<240?[c,h,d]=[0,o,i]:a>=240&&a<300?[c,h,d]=[o,0,i]:[c,h,d]=[i,0,o],[(c+l)*255,(h+l)*255,(d+l)*255]}function Ku(n,e,t){const a=t+e*(100-Math.abs(2*t-100))/200;return[n,a!==0?e*(100-Math.abs(2*t-100))/a:0,t+e*(100-Math.abs(2*t-100))/200]}function qu(n,e,t){const a=100-Math.abs(t*(200-e)/100-100);return[n,a!==0?e*t/a:0,t*(200-e)/200]}function ze(n){return[n[0],n[1],n[2]]}function pa(n,e){return[n[0],n[1],n[2],e]}const Ju={hsl:{hsl:(n,e,t)=>[n,e,t],hsv:Ku,rgb:Hu},hsv:{hsl:qu,hsv:(n,e,t)=>[n,e,t],rgb:Ji},rgb:{hsl:zu,hsv:Xu,rgb:(n,e,t)=>[n,e,t]}};function Kt(n,e){return[e==="float"?1:n==="rgb"?255:360,e==="float"?1:n==="rgb"?255:100,e==="float"?1:n==="rgb"?255:100]}function Yu(n,e){return n===e?e:wi(n,e)}function Yi(n,e,t){var a;const r=Kt(e,t);return[e==="rgb"?se(n[0],0,r[0]):Yu(n[0],r[0]),se(n[1],0,r[1]),se(n[2],0,r[2]),se((a=n[3])!==null&&a!==void 0?a:1,0,1)]}function Rs(n,e,t,a){const r=Kt(e,t),s=Kt(e,a);return n.map((i,o)=>i/r[o]*s[o])}function $i(n,e,t){const a=Rs(n,e.mode,e.type,"int"),r=Ju[e.mode][t.mode](...a);return Rs(r,t.mode,"int",t.type)}class G{static black(){return new G([0,0,0],"rgb")}constructor(e,t){this.type="int",this.mode=t,this.comps_=Yi(e,t,this.type)}getComponents(e){return pa($i(ze(this.comps_),{mode:this.mode,type:this.type},{mode:e??this.mode,type:this.type}),this.comps_[3])}toRgbaObject(){const e=this.getComponents("rgb");return{r:e[0],g:e[1],b:e[2],a:e[3]}}}const ht=U("colp");class $u{constructor(e,t){this.alphaViews_=null,this.element=e.createElement("div"),this.element.classList.add(ht()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("div");a.classList.add(ht("hsv"));const r=e.createElement("div");r.classList.add(ht("sv")),this.svPaletteView_=t.svPaletteView,r.appendChild(this.svPaletteView_.element),a.appendChild(r);const s=e.createElement("div");s.classList.add(ht("h")),this.hPaletteView_=t.hPaletteView,s.appendChild(this.hPaletteView_.element),a.appendChild(s),this.element.appendChild(a);const i=e.createElement("div");if(i.classList.add(ht("rgb")),this.textsView_=t.textsView,i.appendChild(this.textsView_.element),this.element.appendChild(i),t.alphaViews){this.alphaViews_={palette:t.alphaViews.palette,text:t.alphaViews.text};const o=e.createElement("div");o.classList.add(ht("a"));const l=e.createElement("div");l.classList.add(ht("ap")),l.appendChild(this.alphaViews_.palette.element),o.appendChild(l);const c=e.createElement("div");c.classList.add(ht("at")),c.appendChild(this.alphaViews_.text.element),o.appendChild(c),this.element.appendChild(o)}}get allFocusableElements(){const e=[this.svPaletteView_.element,this.hPaletteView_.element,this.textsView_.modeSelectElement,...this.textsView_.inputViews.map(t=>t.inputElement)];return this.alphaViews_&&e.push(this.alphaViews_.palette.element,this.alphaViews_.text.inputElement),e}}function Qu(n){return n==="int"?"int":n==="float"?"float":void 0}function _r(n){return Q(n,e=>({color:e.optional.object({alpha:e.optional.boolean,type:e.optional.custom(Qu)}),expanded:e.optional.boolean,picker:e.optional.custom(qi),readonly:e.optional.constant(!1)}))}function Mt(n){return n?.1:1}function Qi(n){var e;return(e=n.color)===null||e===void 0?void 0:e.type}class dr{constructor(e,t){this.type="float",this.mode=t,this.comps_=Yi(e,t,this.type)}getComponents(e){return pa($i(ze(this.comps_),{mode:this.mode,type:this.type},{mode:e??this.mode,type:this.type}),this.comps_[3])}toRgbaObject(){const e=this.getComponents("rgb");return{r:e[0],g:e[1],b:e[2],a:e[3]}}}const Zu={int:(n,e)=>new G(n,e),float:(n,e)=>new dr(n,e)};function hr(n,e,t){return Zu[t](n,e)}function e_(n){return n.type==="float"}function t_(n){return n.type==="int"}function n_(n){const e=n.getComponents(),t=Kt(n.mode,"int");return new G([Math.round(z(e[0],0,1,0,t[0])),Math.round(z(e[1],0,1,0,t[1])),Math.round(z(e[2],0,1,0,t[2])),e[3]],n.mode)}function a_(n){const e=n.getComponents(),t=Kt(n.mode,"int");return new dr([z(e[0],0,t[0],0,1),z(e[1],0,t[1],0,1),z(e[2],0,t[2],0,1),e[3]],n.mode)}function pe(n,e){if(n.type===e)return n;if(t_(n)&&e==="float")return a_(n);if(e_(n)&&e==="int")return n_(n);throw te.shouldNeverHappen()}function r_(n,e){return n.alpha===e.alpha&&n.mode===e.mode&&n.notation===e.notation&&n.type===e.type}function De(n,e){const t=n.match(/^(.+)%$/);return Math.min(t?parseFloat(t[1])*.01*e:parseFloat(n),e)}const s_={deg:n=>n,grad:n=>n*360/400,rad:n=>n*360/(2*Math.PI),turn:n=>n*360};function Zi(n){const e=n.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);if(!e)return parseFloat(n);const t=parseFloat(e[1]),a=e[2];return s_[a](t)}function eo(n){const e=n.match(/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[De(e[1],255),De(e[2],255),De(e[3],255)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])?null:t}function i_(n){const e=eo(n);return e?new G(e,"rgb"):null}function to(n){const e=n.match(/^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[De(e[1],255),De(e[2],255),De(e[3],255),De(e[4],1)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])||isNaN(t[3])?null:t}function o_(n){const e=to(n);return e?new G(e,"rgb"):null}function no(n){const e=n.match(/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[Zi(e[1]),De(e[2],100),De(e[3],100)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])?null:t}function l_(n){const e=no(n);return e?new G(e,"hsl"):null}function ao(n){const e=n.match(/^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!e)return null;const t=[Zi(e[1]),De(e[2],100),De(e[3],100),De(e[4],1)];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])||isNaN(t[3])?null:t}function c_(n){const e=ao(n);return e?new G(e,"hsl"):null}function ro(n){const e=n.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(e)return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)];const t=n.match(/^(?:#|0x)([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:null}function u_(n){const e=ro(n);return e?new G(e,"rgb"):null}function so(n){const e=n.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(e)return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16),z(parseInt(e[4]+e[4],16),0,255,0,1)];const t=n.match(/^(?:#|0x)?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16),z(parseInt(t[4],16),0,255,0,1)]:null}function __(n){const e=so(n);return e?new G(e,"rgb"):null}function io(n){const e=n.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!e)return null;const t=[parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3])];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])?null:t}function d_(n){return e=>{const t=io(e);return t?hr(t,"rgb",n):null}}function oo(n){const e=n.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*a\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!e)return null;const t=[parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4])];return isNaN(t[0])||isNaN(t[1])||isNaN(t[2])||isNaN(t[3])?null:t}function h_(n){return e=>{const t=oo(e);return t?hr(t,"rgb",n):null}}const f_=[{parser:ro,result:{alpha:!1,mode:"rgb",notation:"hex"}},{parser:so,result:{alpha:!0,mode:"rgb",notation:"hex"}},{parser:eo,result:{alpha:!1,mode:"rgb",notation:"func"}},{parser:to,result:{alpha:!0,mode:"rgb",notation:"func"}},{parser:no,result:{alpha:!1,mode:"hsl",notation:"func"}},{parser:ao,result:{alpha:!0,mode:"hsl",notation:"func"}},{parser:io,result:{alpha:!1,mode:"rgb",notation:"object"}},{parser:oo,result:{alpha:!0,mode:"rgb",notation:"object"}}];function p_(n){return f_.reduce((e,{parser:t,result:a})=>e||(t(n)?a:null),null)}function b_(n,e="int"){const t=p_(n);return t?t.notation==="hex"&&e!=="float"?Object.assign(Object.assign({},t),{type:"int"}):t.notation==="func"?Object.assign(Object.assign({},t),{type:e}):null:null}function Bn(n){const e=[u_,__,i_,o_,l_,c_];e.push(d_("int"),h_("int"));const t=Du(e);return a=>{const r=t(a);return r?pe(r,n):null}}function m_(n){const e=Bn("int");if(typeof n!="string")return G.black();const t=e(n);return t??G.black()}function lo(n){const e=se(Math.floor(n),0,255).toString(16);return e.length===1?`0${e}`:e}function fr(n,e="#"){const t=ze(n.getComponents("rgb")).map(lo).join("");return`${e}${t}`}function pr(n,e="#"){const t=n.getComponents("rgb"),a=[t[0],t[1],t[2],t[3]*255].map(lo).join("");return`${e}${a}`}function co(n){const e=xe(0),t=pe(n,"int");return`rgb(${ze(t.getComponents("rgb")).map(r=>e(r)).join(", ")})`}function $n(n){const e=xe(2),t=xe(0);return`rgba(${pe(n,"int").getComponents("rgb").map((s,i)=>(i===3?e:t)(s)).join(", ")})`}function g_(n){const e=[xe(0),aa,aa],t=pe(n,"int");return`hsl(${ze(t.getComponents("hsl")).map((r,s)=>e[s](r)).join(", ")})`}function v_(n){const e=[xe(0),aa,aa,xe(2)];return`hsla(${pe(n,"int").getComponents("hsl").map((r,s)=>e[s](r)).join(", ")})`}function uo(n,e){const t=xe(e==="float"?2:0),a=["r","g","b"],r=pe(n,e);return`{${ze(r.getComponents("rgb")).map((i,o)=>`${a[o]}: ${t(i)}`).join(", ")}}`}function x_(n){return e=>uo(e,n)}function _o(n,e){const t=xe(2),a=xe(e==="float"?2:0),r=["r","g","b","a"];return`{${pe(n,e).getComponents("rgb").map((o,l)=>{const c=l===3?t:a;return`${r[l]}: ${c(o)}`}).join(", ")}}`}function S_(n){return e=>_o(e,n)}const T_=[{format:{alpha:!1,mode:"rgb",notation:"hex",type:"int"},stringifier:fr},{format:{alpha:!0,mode:"rgb",notation:"hex",type:"int"},stringifier:pr},{format:{alpha:!1,mode:"rgb",notation:"func",type:"int"},stringifier:co},{format:{alpha:!0,mode:"rgb",notation:"func",type:"int"},stringifier:$n},{format:{alpha:!1,mode:"hsl",notation:"func",type:"int"},stringifier:g_},{format:{alpha:!0,mode:"hsl",notation:"func",type:"int"},stringifier:v_},...["int","float"].reduce((n,e)=>[...n,{format:{alpha:!1,mode:"rgb",notation:"object",type:e},stringifier:x_(e)},{format:{alpha:!0,mode:"rgb",notation:"object",type:e},stringifier:S_(e)}],[])];function ho(n){return T_.reduce((e,t)=>e||(r_(t.format,n)?t.stringifier:null),null)}const cn=U("apl");class w_{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.value=t.value,this.value.emitter.on("change",this.onValueChange_),this.element=e.createElement("div"),this.element.classList.add(cn()),t.viewProps.bindClassModifiers(this.element),t.viewProps.bindTabIndex(this.element);const a=e.createElement("div");a.classList.add(cn("b")),this.element.appendChild(a);const r=e.createElement("div");r.classList.add(cn("c")),a.appendChild(r),this.colorElem_=r;const s=e.createElement("div");s.classList.add(cn("m")),this.element.appendChild(s),this.markerElem_=s;const i=e.createElement("div");i.classList.add(cn("p")),this.markerElem_.appendChild(i),this.previewElem_=i,this.update_()}update_(){const e=this.value.rawValue,t=e.getComponents("rgb"),a=new G([t[0],t[1],t[2],0],"rgb"),r=new G([t[0],t[1],t[2],255],"rgb"),s=["to right",$n(a),$n(r)];this.colorElem_.style.background=`linear-gradient(${s.join(",")})`,this.previewElem_.style.backgroundColor=$n(e);const i=z(t[3],0,1,0,100);this.markerElem_.style.left=`${i}%`}onValueChange_(){this.update_()}}class y_{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new w_(e,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new kt(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const a=e.point.x/e.bounds.width,r=this.value.rawValue,[s,i,o]=r.getComponents("hsv");this.value.setRawValue(new G([s,i,o,a],"hsv"),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){const t=ve(Mt(!0),_t(e));if(t===0)return;const a=this.value.rawValue,[r,s,i,o]=a.getComponents("hsv");this.value.setRawValue(new G([r,s,i,o+t],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(e){ve(Mt(!0),_t(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const Bt=U("coltxt");function E_(n){const e=n.createElement("select"),t=[{text:"RGB",value:"rgb"},{text:"HSL",value:"hsl"},{text:"HSV",value:"hsv"},{text:"HEX",value:"hex"}];return e.appendChild(t.reduce((a,r)=>{const s=n.createElement("option");return s.textContent=r.text,s.value=r.value,a.appendChild(s),a},n.createDocumentFragment())),e}class C_{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(Bt()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("div");a.classList.add(Bt("m")),this.modeElem_=E_(e),this.modeElem_.classList.add(Bt("ms")),a.appendChild(this.modeSelectElement),t.viewProps.bindDisabled(this.modeElem_);const r=e.createElement("div");r.classList.add(Bt("mm")),r.appendChild(ha(e,"dropdown")),a.appendChild(r),this.element.appendChild(a);const s=e.createElement("div");s.classList.add(Bt("w")),this.element.appendChild(s),this.inputsElem_=s,this.inputViews_=t.inputViews,this.applyInputViews_(),lt(t.mode,i=>{this.modeElem_.value=i})}get modeSelectElement(){return this.modeElem_}get inputViews(){return this.inputViews_}set inputViews(e){this.inputViews_=e,this.applyInputViews_()}applyInputViews_(){Pi(this.inputsElem_);const e=this.element.ownerDocument;this.inputViews_.forEach(t=>{const a=e.createElement("div");a.classList.add(Bt("c")),a.appendChild(t.element),this.inputsElem_.appendChild(a)})}}function I_(n){return xe(n==="float"?2:0)}function R_(n,e,t){const a=Kt(n,e)[t];return new An({min:0,max:a})}function A_(n,e,t){return new Nn(n,{arrayPosition:t===0?"fst":t===2?"lst":"mid",parser:e.parser,props:V.fromObject({formatter:I_(e.colorType),keyScale:Mt(!1),pointerScale:e.colorType==="float"?.01:1}),value:Y(0,{constraint:R_(e.colorMode,e.colorType,t)}),viewProps:e.viewProps})}function D_(n,e){const t={colorMode:e.colorMode,colorType:e.colorType,parser:ut,viewProps:e.viewProps};return[0,1,2].map(a=>{const r=A_(n,t,a);return tn({primary:e.value,secondary:r.value,forward(s){return pe(s,e.colorType).getComponents(e.colorMode)[a]},backward(s,i){const o=e.colorMode,c=pe(s,e.colorType).getComponents(o);c[a]=i;const h=hr(pa(ze(c),c[3]),o,e.colorType);return pe(h,"int")}}),r})}function M_(n,e){const t=new Sn(n,{parser:Bn("int"),props:V.fromObject({formatter:fr}),value:Y(G.black()),viewProps:e.viewProps});return tn({primary:e.value,secondary:t.value,forward:a=>new G(ze(a.getComponents()),a.mode),backward:(a,r)=>new G(pa(ze(r.getComponents(a.mode)),a.getComponents()[3]),a.mode)}),[t]}function P_(n){return n!=="hex"}class F_{constructor(e,t){this.onModeSelectChange_=this.onModeSelectChange_.bind(this),this.colorType_=t.colorType,this.value=t.value,this.viewProps=t.viewProps,this.colorMode=Y(this.value.rawValue.mode),this.ccs_=this.createComponentControllers_(e),this.view=new C_(e,{mode:this.colorMode,inputViews:[this.ccs_[0].view,this.ccs_[1].view,this.ccs_[2].view],viewProps:this.viewProps}),this.view.modeSelectElement.addEventListener("change",this.onModeSelectChange_)}createComponentControllers_(e){const t=this.colorMode.rawValue;return P_(t)?D_(e,{colorMode:t,colorType:this.colorType_,value:this.value,viewProps:this.viewProps}):M_(e,{value:this.value,viewProps:this.viewProps})}onModeSelectChange_(e){const t=e.currentTarget;this.colorMode.rawValue=t.value,this.ccs_=this.createComponentControllers_(this.view.element.ownerDocument),this.view.inputViews=this.ccs_.map(a=>a.view)}}const ya=U("hpl");class k_{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.value=t.value,this.value.emitter.on("change",this.onValueChange_),this.element=e.createElement("div"),this.element.classList.add(ya()),t.viewProps.bindClassModifiers(this.element),t.viewProps.bindTabIndex(this.element);const a=e.createElement("div");a.classList.add(ya("c")),this.element.appendChild(a);const r=e.createElement("div");r.classList.add(ya("m")),this.element.appendChild(r),this.markerElem_=r,this.update_()}update_(){const e=this.value.rawValue,[t]=e.getComponents("hsv");this.markerElem_.style.backgroundColor=co(new G([t,100,100],"hsv"));const a=z(t,0,360,0,100);this.markerElem_.style.left=`${a}%`}onValueChange_(){this.update_()}}class N_{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new k_(e,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new kt(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const a=z(se(e.point.x,0,e.bounds.width),0,e.bounds.width,0,360),r=this.value.rawValue,[,s,i,o]=r.getComponents("hsv");this.value.setRawValue(new G([a,s,i,o],"hsv"),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){const t=ve(Mt(!1),_t(e));if(t===0)return;const a=this.value.rawValue,[r,s,i,o]=a.getComponents("hsv");this.value.setRawValue(new G([r+t,s,i,o],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(e){ve(Mt(!1),_t(e))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const Ea=U("svp"),As=64;class j_{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),this.value=t.value,this.value.emitter.on("change",this.onValueChange_),this.element=e.createElement("div"),this.element.classList.add(Ea()),t.viewProps.bindClassModifiers(this.element),t.viewProps.bindTabIndex(this.element);const a=e.createElement("canvas");a.height=As,a.width=As,a.classList.add(Ea("c")),this.element.appendChild(a),this.canvasElement=a;const r=e.createElement("div");r.classList.add(Ea("m")),this.element.appendChild(r),this.markerElem_=r,this.update_()}update_(){const e=Nc(this.canvasElement);if(!e)return;const a=this.value.rawValue.getComponents("hsv"),r=this.canvasElement.width,s=this.canvasElement.height,i=e.getImageData(0,0,r,s),o=i.data;for(let h=0;h<s;h++)for(let d=0;d<r;d++){const m=z(d,0,r,0,100),b=z(h,0,s,100,0),_=Ji(a[0],m,b),p=(h*r+d)*4;o[p]=_[0],o[p+1]=_[1],o[p+2]=_[2],o[p+3]=255}e.putImageData(i,0,0);const l=z(a[1],0,100,0,100);this.markerElem_.style.left=`${l}%`;const c=z(a[2],0,100,100,0);this.markerElem_.style.top=`${c}%`}onValueChange_(){this.update_()}}class B_{constructor(e,t){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.view=new j_(e,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new kt(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const a=z(e.point.x,0,e.bounds.width,0,100),r=z(e.point.y,0,e.bounds.height,100,0),[s,,,i]=this.value.rawValue.getComponents("hsv");this.value.setRawValue(new G([s,a,r,i],"hsv"),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onKeyDown_(e){Hi(e.key)&&e.preventDefault();const[t,a,r,s]=this.value.rawValue.getComponents("hsv"),i=Mt(!1),o=ve(i,_t(e)),l=ve(i,Tn(e));o===0&&l===0||this.value.setRawValue(new G([t,a+o,r+l,s],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(e){const t=Mt(!1),a=ve(t,_t(e)),r=ve(t,Tn(e));a===0&&r===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}class O_{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.hPaletteC_=new N_(e,{value:this.value,viewProps:this.viewProps}),this.svPaletteC_=new B_(e,{value:this.value,viewProps:this.viewProps}),this.alphaIcs_=t.supportsAlpha?{palette:new y_(e,{value:this.value,viewProps:this.viewProps}),text:new Nn(e,{parser:ut,props:V.fromObject({pointerScale:.01,keyScale:.1,formatter:xe(2)}),value:Y(0,{constraint:new An({min:0,max:1})}),viewProps:this.viewProps})}:null,this.alphaIcs_&&tn({primary:this.value,secondary:this.alphaIcs_.text.value,forward:a=>a.getComponents()[3],backward:(a,r)=>{const s=a.getComponents();return s[3]=r,new G(s,a.mode)}}),this.textsC_=new F_(e,{colorType:t.colorType,value:this.value,viewProps:this.viewProps}),this.view=new $u(e,{alphaViews:this.alphaIcs_?{palette:this.alphaIcs_.palette.view,text:this.alphaIcs_.text.view}:null,hPaletteView:this.hPaletteC_.view,supportsAlpha:t.supportsAlpha,svPaletteView:this.svPaletteC_.view,textsView:this.textsC_.view,viewProps:this.viewProps})}get textsController(){return this.textsC_}}const Ca=U("colsw");class V_{constructor(e,t){this.onValueChange_=this.onValueChange_.bind(this),t.value.emitter.on("change",this.onValueChange_),this.value=t.value,this.element=e.createElement("div"),this.element.classList.add(Ca()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("div");a.classList.add(Ca("sw")),this.element.appendChild(a),this.swatchElem_=a;const r=e.createElement("button");r.classList.add(Ca("b")),t.viewProps.bindDisabled(r),this.element.appendChild(r),this.buttonElement=r,this.update_()}update_(){const e=this.value.rawValue;this.swatchElem_.style.backgroundColor=pr(e)}onValueChange_(){this.update_()}}class L_{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.view=new V_(e,{value:this.value,viewProps:this.viewProps})}}class br{constructor(e,t){this.onButtonBlur_=this.onButtonBlur_.bind(this),this.onButtonClick_=this.onButtonClick_.bind(this),this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.foldable_=Mn.create(t.expanded),this.swatchC_=new L_(e,{value:this.value,viewProps:this.viewProps});const a=this.swatchC_.view.buttonElement;a.addEventListener("blur",this.onButtonBlur_),a.addEventListener("click",this.onButtonClick_),this.textC_=new Sn(e,{parser:t.parser,props:V.fromObject({formatter:t.formatter}),value:this.value,viewProps:this.viewProps}),this.view=new Wu(e,{foldable:this.foldable_,pickerLayout:t.pickerLayout}),this.view.swatchElement.appendChild(this.swatchC_.view.element),this.view.textElement.appendChild(this.textC_.view.element),this.popC_=t.pickerLayout==="popup"?new Gi(e,{viewProps:this.viewProps}):null;const r=new O_(e,{colorType:t.colorType,supportsAlpha:t.supportsAlpha,value:this.value,viewProps:this.viewProps});r.view.allFocusableElements.forEach(s=>{s.addEventListener("blur",this.onPopupChildBlur_),s.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=r,this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(r.view.element),tn({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:s=>s,backward:(s,i)=>i})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),or(this.foldable_,this.view.pickerElement))}get textController(){return this.textC_}onButtonBlur_(e){if(!this.popC_)return;const t=this.view.element,a=e.relatedTarget;(!a||!t.contains(a))&&(this.popC_.shows.rawValue=!1)}onButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(e){if(!this.popC_)return;const t=this.popC_.view.element,a=Fi(e);a&&t.contains(a)||a&&a===this.swatchC_.view.buttonElement&&!tr(t.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(e){this.popC_?e.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&e.key==="Escape"&&this.swatchC_.view.buttonElement.focus()}}function U_(n){return ze(n.getComponents("rgb")).reduce((e,t)=>e<<8|Math.floor(t)&255,0)}function G_(n){return n.getComponents("rgb").reduce((e,t,a)=>{const r=Math.floor(a===3?t*255:t)&255;return e<<8|r},0)>>>0}function W_(n){return new G([n>>16&255,n>>8&255,n&255],"rgb")}function z_(n){return new G([n>>24&255,n>>16&255,n>>8&255,z(n&255,0,255,0,1)],"rgb")}function H_(n){return typeof n!="number"?G.black():W_(n)}function X_(n){return typeof n!="number"?G.black():z_(n)}function Qn(n,e){return typeof n!="object"||q(n)?!1:e in n&&typeof n[e]=="number"}function fo(n){return Qn(n,"r")&&Qn(n,"g")&&Qn(n,"b")}function po(n){return fo(n)&&Qn(n,"a")}function bo(n){return fo(n)}function mr(n,e){if(n.mode!==e.mode||n.type!==e.type)return!1;const t=n.getComponents(),a=e.getComponents();for(let r=0;r<t.length;r++)if(t[r]!==a[r])return!1;return!0}function Ds(n){return"a"in n?[n.r,n.g,n.b,n.a]:[n.r,n.g,n.b]}function K_(n){const e=ho(n);return e?(t,a)=>{jn(t,e(a))}:null}function q_(n){const e=n?G_:U_;return(t,a)=>{jn(t,e(a))}}function J_(n,e,t){const r=pe(e,t).toRgbaObject();n.writeProperty("r",r.r),n.writeProperty("g",r.g),n.writeProperty("b",r.b),n.writeProperty("a",r.a)}function Y_(n,e,t){const r=pe(e,t).toRgbaObject();n.writeProperty("r",r.r),n.writeProperty("g",r.g),n.writeProperty("b",r.b)}function $_(n,e){return(t,a)=>{n?J_(t,a,e):Y_(t,a,e)}}function Q_(n){var e;return!!(!((e=n==null?void 0:n.color)===null||e===void 0)&&e.alpha)}function Z_(n){return n?e=>pr(e,"0x"):e=>fr(e,"0x")}function ed(n){return"color"in n||n.view==="color"}const td=be({id:"input-color-number",type:"input",accept:(n,e)=>{if(typeof n!="number"||!ed(e))return null;const t=_r(e);return t?{initialValue:n,params:Object.assign(Object.assign({},t),{supportsAlpha:Q_(e)})}:null},binding:{reader:n=>n.params.supportsAlpha?X_:H_,equals:mr,writer:n=>q_(n.params.supportsAlpha)},controller:n=>{var e,t;return new br(n.document,{colorType:"int",expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,formatter:Z_(n.params.supportsAlpha),parser:Bn("int"),pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",supportsAlpha:n.params.supportsAlpha,value:n.value,viewProps:n.viewProps})}});function nd(n,e){if(!bo(n))return pe(G.black(),e);if(e==="int"){const t=Ds(n);return new G(t,"rgb")}if(e==="float"){const t=Ds(n);return new dr(t,"rgb")}return pe(G.black(),"int")}function ad(n){return po(n)}function rd(n){return e=>{const t=nd(e,n);return pe(t,"int")}}function sd(n,e){return t=>n?_o(t,e):uo(t,e)}const id=be({id:"input-color-object",type:"input",accept:(n,e)=>{var t;if(!bo(n))return null;const a=_r(e);return a?{initialValue:n,params:Object.assign(Object.assign({},a),{colorType:(t=Qi(e))!==null&&t!==void 0?t:"int"})}:null},binding:{reader:n=>rd(n.params.colorType),equals:mr,writer:n=>$_(ad(n.initialValue),n.params.colorType)},controller:n=>{var e,t;const a=po(n.initialValue);return new br(n.document,{colorType:n.params.colorType,expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,formatter:sd(a,n.params.colorType),parser:Bn("int"),pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",supportsAlpha:a,value:n.value,viewProps:n.viewProps})}}),od=be({id:"input-color-string",type:"input",accept:(n,e)=>{if(typeof n!="string"||e.view==="text")return null;const t=b_(n,Qi(e));if(!t)return null;const a=ho(t);if(!a)return null;const r=_r(e);return r?{initialValue:n,params:Object.assign(Object.assign({},r),{format:t,stringifier:a})}:null},binding:{reader:()=>m_,equals:mr,writer:n=>{const e=K_(n.params.format);if(!e)throw te.notBindable();return e}},controller:n=>{var e,t;return new br(n.document,{colorType:n.params.format.type,expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,formatter:n.params.stringifier,parser:Bn("int"),pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",supportsAlpha:n.params.format.alpha,value:n.value,viewProps:n.viewProps})}});class gr{constructor(e){this.components=e.components,this.asm_=e.assembly}constrain(e){const t=this.asm_.toComponents(e).map((a,r)=>{var s,i;return(i=(s=this.components[r])===null||s===void 0?void 0:s.constrain(a))!==null&&i!==void 0?i:a});return this.asm_.fromComponents(t)}}const Ms=U("pndtxt");class ld{constructor(e,t){this.textViews=t.textViews,this.element=e.createElement("div"),this.element.classList.add(Ms()),this.textViews.forEach(a=>{const r=e.createElement("div");r.classList.add(Ms("a")),r.appendChild(a.element),this.element.appendChild(r)})}}function cd(n,e,t){return new Nn(n,{arrayPosition:t===0?"fst":t===e.axes.length-1?"lst":"mid",parser:e.parser,props:e.axes[t].textProps,value:Y(0,{constraint:e.axes[t].constraint}),viewProps:e.viewProps})}class vr{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.acs_=t.axes.map((a,r)=>cd(e,t,r)),this.acs_.forEach((a,r)=>{tn({primary:this.value,secondary:a.value,forward:s=>t.assembly.toComponents(s)[r],backward:(s,i)=>{const o=t.assembly.toComponents(s);return o[r]=i,t.assembly.fromComponents(o)}})}),this.view=new ld(e,{textViews:this.acs_.map(a=>a.view)})}get textControllers(){return this.acs_}}class ud extends xn{get max(){return this.controller.valueController.sliderController.props.get("max")}set max(e){this.controller.valueController.sliderController.props.set("max",e)}get min(){return this.controller.valueController.sliderController.props.get("min")}set min(e){this.controller.valueController.sliderController.props.set("min",e)}}function _d(n,e){const t=[],a=Ci(n,e);a&&t.push(a);const r=Ii(n);r&&t.push(r);const s=ur(n.options);return s&&t.push(s),new Pn(t)}const dd=be({id:"input-number",type:"input",accept:(n,e)=>{if(typeof n!="number")return null;const t=Q(e,a=>Object.assign(Object.assign({},Ai(a)),{options:a.optional.custom(kn),readonly:a.optional.constant(!1)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>Ti,constraint:n=>_d(n.params,n.initialValue),writer:n=>jn},controller:n=>{const e=n.value,t=n.constraint,a=t&&na(t,Fn);if(a)return new Tt(n.document,{props:new V({options:a.values.value("options")}),value:e,viewProps:n.viewProps});const r=Ri(n.params,e.rawValue),s=t&&na(t,An);return s?new ra(n.document,Object.assign(Object.assign({},Xi(Object.assign(Object.assign({},r),{keyScale:Y(r.keyScale),max:s.values.value("max"),min:s.values.value("min")}))),{parser:ut,value:e,viewProps:n.viewProps})):new Nn(n.document,{parser:ut,props:V.fromObject(r),value:e,viewProps:n.viewProps})},api(n){return typeof n.controller.value.rawValue!="number"?null:n.controller.valueController instanceof ra?new ud(n.controller):n.controller.valueController instanceof Tt?new lr(n.controller):null}});class xt{constructor(e=0,t=0){this.x=e,this.y=t}getComponents(){return[this.x,this.y]}static isObject(e){if(q(e))return!1;const t=e.x,a=e.y;return!(typeof t!="number"||typeof a!="number")}static equals(e,t){return e.x===t.x&&e.y===t.y}toObject(){return{x:this.x,y:this.y}}}const mo={toComponents:n=>n.getComponents(),fromComponents:n=>new xt(...n)},Ot=U("p2d");class hd{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(Ot()),t.viewProps.bindClassModifiers(this.element),lt(t.expanded,Qt(this.element,Ot(void 0,"expanded")));const a=e.createElement("div");a.classList.add(Ot("h")),this.element.appendChild(a);const r=e.createElement("button");r.classList.add(Ot("b")),r.appendChild(ha(e,"p2dpad")),t.viewProps.bindDisabled(r),a.appendChild(r),this.buttonElement=r;const s=e.createElement("div");if(s.classList.add(Ot("t")),a.appendChild(s),this.textElement=s,t.pickerLayout==="inline"){const i=e.createElement("div");i.classList.add(Ot("p")),this.element.appendChild(i),this.pickerElement=i}else this.pickerElement=null}}const ft=U("p2dp");class fd{constructor(e,t){this.onFoldableChange_=this.onFoldableChange_.bind(this),this.onPropsChange_=this.onPropsChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.props_=t.props,this.props_.emitter.on("change",this.onPropsChange_),this.element=e.createElement("div"),this.element.classList.add(ft()),t.layout==="popup"&&this.element.classList.add(ft(void 0,"p")),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("div");a.classList.add(ft("p")),t.viewProps.bindTabIndex(a),this.element.appendChild(a),this.padElement=a;const r=e.createElementNS(Le,"svg");r.classList.add(ft("g")),this.padElement.appendChild(r),this.svgElem_=r;const s=e.createElementNS(Le,"line");s.classList.add(ft("ax")),s.setAttributeNS(null,"x1","0"),s.setAttributeNS(null,"y1","50%"),s.setAttributeNS(null,"x2","100%"),s.setAttributeNS(null,"y2","50%"),this.svgElem_.appendChild(s);const i=e.createElementNS(Le,"line");i.classList.add(ft("ax")),i.setAttributeNS(null,"x1","50%"),i.setAttributeNS(null,"y1","0"),i.setAttributeNS(null,"x2","50%"),i.setAttributeNS(null,"y2","100%"),this.svgElem_.appendChild(i);const o=e.createElementNS(Le,"line");o.classList.add(ft("l")),o.setAttributeNS(null,"x1","50%"),o.setAttributeNS(null,"y1","50%"),this.svgElem_.appendChild(o),this.lineElem_=o;const l=e.createElement("div");l.classList.add(ft("m")),this.padElement.appendChild(l),this.markerElem_=l,t.value.emitter.on("change",this.onValueChange_),this.value=t.value,this.update_()}get allFocusableElements(){return[this.padElement]}update_(){const[e,t]=this.value.rawValue.getComponents(),a=this.props_.get("max"),r=z(e,-a,+a,0,100),s=z(t,-a,+a,0,100),i=this.props_.get("invertsY")?100-s:s;this.lineElem_.setAttributeNS(null,"x2",`${r}%`),this.lineElem_.setAttributeNS(null,"y2",`${i}%`),this.markerElem_.style.left=`${r}%`,this.markerElem_.style.top=`${i}%`}onValueChange_(){this.update_()}onPropsChange_(){this.update_()}onFoldableChange_(){this.update_()}}function Ps(n,e,t){return[ve(e[0],_t(n)),ve(e[1],Tn(n))*(t?1:-1)]}class pd{constructor(e,t){this.onPadKeyDown_=this.onPadKeyDown_.bind(this),this.onPadKeyUp_=this.onPadKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.view=new fd(e,{layout:t.layout,props:this.props,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new kt(this.view.padElement),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.padElement.addEventListener("keydown",this.onPadKeyDown_),this.view.padElement.addEventListener("keyup",this.onPadKeyUp_)}handlePointerEvent_(e,t){if(!e.point)return;const a=this.props.get("max"),r=z(e.point.x,0,e.bounds.width,-a,+a),s=z(this.props.get("invertsY")?e.bounds.height-e.point.y:e.point.y,0,e.bounds.height,-a,+a);this.value.setRawValue(new xt(r,s),t)}onPointerDown_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerMove_(e){this.handlePointerEvent_(e.data,{forceEmit:!1,last:!1})}onPointerUp_(e){this.handlePointerEvent_(e.data,{forceEmit:!0,last:!0})}onPadKeyDown_(e){Hi(e.key)&&e.preventDefault();const[t,a]=Ps(e,[this.props.get("xKeyScale"),this.props.get("yKeyScale")],this.props.get("invertsY"));t===0&&a===0||this.value.setRawValue(new xt(this.value.rawValue.x+t,this.value.rawValue.y+a),{forceEmit:!1,last:!1})}onPadKeyUp_(e){const[t,a]=Ps(e,[this.props.get("xKeyScale"),this.props.get("yKeyScale")],this.props.get("invertsY"));t===0&&a===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}class bd{constructor(e,t){var a,r;this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.onPadButtonBlur_=this.onPadButtonBlur_.bind(this),this.onPadButtonClick_=this.onPadButtonClick_.bind(this),this.value=t.value,this.viewProps=t.viewProps,this.foldable_=Mn.create(t.expanded),this.popC_=t.pickerLayout==="popup"?new Gi(e,{viewProps:this.viewProps}):null;const s=new pd(e,{layout:t.pickerLayout,props:new V({invertsY:Y(t.invertsY),max:Y(t.max),xKeyScale:t.axes[0].textProps.value("keyScale"),yKeyScale:t.axes[1].textProps.value("keyScale")}),value:this.value,viewProps:this.viewProps});s.view.allFocusableElements.forEach(i=>{i.addEventListener("blur",this.onPopupChildBlur_),i.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=s,this.textC_=new vr(e,{assembly:mo,axes:t.axes,parser:t.parser,value:this.value,viewProps:this.viewProps}),this.view=new hd(e,{expanded:this.foldable_.value("expanded"),pickerLayout:t.pickerLayout,viewProps:this.viewProps}),this.view.textElement.appendChild(this.textC_.view.element),(a=this.view.buttonElement)===null||a===void 0||a.addEventListener("blur",this.onPadButtonBlur_),(r=this.view.buttonElement)===null||r===void 0||r.addEventListener("click",this.onPadButtonClick_),this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(this.pickerC_.view.element),tn({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:i=>i,backward:(i,o)=>o})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),or(this.foldable_,this.view.pickerElement))}get textController(){return this.textC_}onPadButtonBlur_(e){if(!this.popC_)return;const t=this.view.element,a=e.relatedTarget;(!a||!t.contains(a))&&(this.popC_.shows.rawValue=!1)}onPadButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(e){if(!this.popC_)return;const t=this.popC_.view.element,a=Fi(e);a&&t.contains(a)||a&&a===this.view.buttonElement&&!tr(t.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(e){this.popC_?e.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&e.key==="Escape"&&this.view.buttonElement.focus()}}function md(n){return xt.isObject(n)?new xt(n.x,n.y):new xt}function gd(n,e){n.writeProperty("x",e.x),n.writeProperty("y",e.y)}function vd(n,e){return new gr({assembly:mo,components:[ot(Object.assign(Object.assign({},n),n.x),e.x),ot(Object.assign(Object.assign({},n),n.y),e.y)]})}function Fs(n,e){var t,a;if(!q(n.min)||!q(n.max))return Math.max(Math.abs((t=n.min)!==null&&t!==void 0?t:0),Math.abs((a=n.max)!==null&&a!==void 0?a:0));const r=yi(n);return Math.max(Math.abs(r)*10,Math.abs(e)*10)}function xd(n,e){var t,a;const r=Fs(At(n,(t=n.x)!==null&&t!==void 0?t:{}),e.x),s=Fs(At(n,(a=n.y)!==null&&a!==void 0?a:{}),e.y);return Math.max(r,s)}function Sd(n){if(!("y"in n))return!1;const e=n.y;return e&&"inverted"in e?!!e.inverted:!1}const Td=be({id:"input-point2d",type:"input",accept:(n,e)=>{if(!xt.isObject(n))return null;const t=Q(e,a=>Object.assign(Object.assign({},wn(a)),{expanded:a.optional.boolean,picker:a.optional.custom(qi),readonly:a.optional.constant(!1),x:a.optional.custom(gt),y:a.optional.object(Object.assign(Object.assign({},wn(a)),{inverted:a.optional.boolean}))}));return t?{initialValue:n,params:t}:null},binding:{reader:()=>md,constraint:n=>vd(n.params,n.initialValue),equals:xt.equals,writer:()=>gd},controller:n=>{var e,t;const a=n.document,r=n.value,s=n.constraint,i=[n.params.x,n.params.y];return new bd(a,{axes:r.rawValue.getComponents().map((o,l)=>{var c;return er({constraint:s.components[l],initialValue:o,params:At(n.params,(c=i[l])!==null&&c!==void 0?c:{})})}),expanded:(e=n.params.expanded)!==null&&e!==void 0?e:!1,invertsY:Sd(n.params),max:xd(n.params,r.rawValue),parser:ut,pickerLayout:(t=n.params.picker)!==null&&t!==void 0?t:"popup",value:r,viewProps:n.viewProps})}});class zt{constructor(e=0,t=0,a=0){this.x=e,this.y=t,this.z=a}getComponents(){return[this.x,this.y,this.z]}static isObject(e){if(q(e))return!1;const t=e.x,a=e.y,r=e.z;return!(typeof t!="number"||typeof a!="number"||typeof r!="number")}static equals(e,t){return e.x===t.x&&e.y===t.y&&e.z===t.z}toObject(){return{x:this.x,y:this.y,z:this.z}}}const go={toComponents:n=>n.getComponents(),fromComponents:n=>new zt(...n)};function wd(n){return zt.isObject(n)?new zt(n.x,n.y,n.z):new zt}function yd(n,e){n.writeProperty("x",e.x),n.writeProperty("y",e.y),n.writeProperty("z",e.z)}function Ed(n,e){return new gr({assembly:go,components:[ot(Object.assign(Object.assign({},n),n.x),e.x),ot(Object.assign(Object.assign({},n),n.y),e.y),ot(Object.assign(Object.assign({},n),n.z),e.z)]})}const Cd=be({id:"input-point3d",type:"input",accept:(n,e)=>{if(!zt.isObject(n))return null;const t=Q(e,a=>Object.assign(Object.assign({},wn(a)),{readonly:a.optional.constant(!1),x:a.optional.custom(gt),y:a.optional.custom(gt),z:a.optional.custom(gt)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>wd,constraint:n=>Ed(n.params,n.initialValue),equals:zt.equals,writer:n=>yd},controller:n=>{const e=n.value,t=n.constraint,a=[n.params.x,n.params.y,n.params.z];return new vr(n.document,{assembly:go,axes:e.rawValue.getComponents().map((r,s)=>{var i;return er({constraint:t.components[s],initialValue:r,params:At(n.params,(i=a[s])!==null&&i!==void 0?i:{})})}),parser:ut,value:e,viewProps:n.viewProps})}});class Ht{constructor(e=0,t=0,a=0,r=0){this.x=e,this.y=t,this.z=a,this.w=r}getComponents(){return[this.x,this.y,this.z,this.w]}static isObject(e){if(q(e))return!1;const t=e.x,a=e.y,r=e.z,s=e.w;return!(typeof t!="number"||typeof a!="number"||typeof r!="number"||typeof s!="number")}static equals(e,t){return e.x===t.x&&e.y===t.y&&e.z===t.z&&e.w===t.w}toObject(){return{x:this.x,y:this.y,z:this.z,w:this.w}}}const vo={toComponents:n=>n.getComponents(),fromComponents:n=>new Ht(...n)};function Id(n){return Ht.isObject(n)?new Ht(n.x,n.y,n.z,n.w):new Ht}function Rd(n,e){n.writeProperty("x",e.x),n.writeProperty("y",e.y),n.writeProperty("z",e.z),n.writeProperty("w",e.w)}function Ad(n,e){return new gr({assembly:vo,components:[ot(Object.assign(Object.assign({},n),n.x),e.x),ot(Object.assign(Object.assign({},n),n.y),e.y),ot(Object.assign(Object.assign({},n),n.z),e.z),ot(Object.assign(Object.assign({},n),n.w),e.w)]})}const Dd=be({id:"input-point4d",type:"input",accept:(n,e)=>{if(!Ht.isObject(n))return null;const t=Q(e,a=>Object.assign(Object.assign({},wn(a)),{readonly:a.optional.constant(!1),w:a.optional.custom(gt),x:a.optional.custom(gt),y:a.optional.custom(gt),z:a.optional.custom(gt)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>Id,constraint:n=>Ad(n.params,n.initialValue),equals:Ht.equals,writer:n=>Rd},controller:n=>{const e=n.value,t=n.constraint,a=[n.params.x,n.params.y,n.params.z,n.params.w];return new vr(n.document,{assembly:vo,axes:e.rawValue.getComponents().map((r,s)=>{var i;return er({constraint:t.components[s],initialValue:r,params:At(n.params,(i=a[s])!==null&&i!==void 0?i:{})})}),parser:ut,value:e,viewProps:n.viewProps})}});function Md(n){const e=[],t=ur(n.options);return t&&e.push(t),new Pn(e)}const Pd=be({id:"input-string",type:"input",accept:(n,e)=>{if(typeof n!="string")return null;const t=Q(e,a=>({readonly:a.optional.constant(!1),options:a.optional.custom(kn)}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>zi,constraint:n=>Md(n.params),writer:n=>jn},controller:n=>{const e=n.document,t=n.value,a=n.constraint,r=a&&na(a,Fn);return r?new Tt(e,{props:new V({options:r.values.value("options")}),value:t,viewProps:n.viewProps}):new Sn(e,{parser:s=>s,props:V.fromObject({formatter:Oa}),value:t,viewProps:n.viewProps})},api(n){return typeof n.controller.value.rawValue!="string"?null:n.controller.valueController instanceof Tt?new lr(n.controller):null}}),On={monitor:{defaultInterval:200,defaultRows:3}},ks=U("mll");class Fd{constructor(e,t){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=t.formatter,this.element=e.createElement("div"),this.element.classList.add(ks()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("textarea");a.classList.add(ks("i")),a.style.height=`calc(var(${Ki("containerUnitSize")}) * ${t.rows})`,a.readOnly=!0,t.viewProps.bindDisabled(a),this.element.appendChild(a),this.textareaElem_=a,t.value.emitter.on("change",this.onValueUpdate_),this.value=t.value,this.update_()}update_(){const e=this.textareaElem_,t=e.scrollTop===e.scrollHeight-e.clientHeight,a=[];this.value.rawValue.forEach(r=>{r!==void 0&&a.push(this.formatter_(r))}),e.textContent=a.join(`
`),t&&(e.scrollTop=e.scrollHeight)}onValueUpdate_(){this.update_()}}class xr{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.view=new Fd(e,{formatter:t.formatter,rows:t.rows,value:this.value,viewProps:this.viewProps})}}const Ns=U("sgl");class kd{constructor(e,t){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=t.formatter,this.element=e.createElement("div"),this.element.classList.add(Ns()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("input");a.classList.add(Ns("i")),a.readOnly=!0,a.type="text",t.viewProps.bindDisabled(a),this.element.appendChild(a),this.inputElement=a,t.value.emitter.on("change",this.onValueUpdate_),this.value=t.value,this.update_()}update_(){const e=this.value.rawValue,t=e[e.length-1];this.inputElement.value=t!==void 0?this.formatter_(t):""}onValueUpdate_(){this.update_()}}class Sr{constructor(e,t){this.value=t.value,this.viewProps=t.viewProps,this.view=new kd(e,{formatter:t.formatter,value:this.value,viewProps:this.viewProps})}}const Nd=be({id:"monitor-bool",type:"monitor",accept:(n,e)=>{if(typeof n!="boolean")return null;const t=Q(e,a=>({readonly:a.required.constant(!0),rows:a.optional.number}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>Wi},controller:n=>{var e;return n.value.rawValue.length===1?new Sr(n.document,{formatter:Is,value:n.value,viewProps:n.viewProps}):new xr(n.document,{formatter:Is,rows:(e=n.params.rows)!==null&&e!==void 0?e:On.monitor.defaultRows,value:n.value,viewProps:n.viewProps})}});class jd extends xn{get max(){return this.controller.valueController.props.get("max")}set max(e){this.controller.valueController.props.set("max",e)}get min(){return this.controller.valueController.props.get("min")}set min(e){this.controller.valueController.props.set("min",e)}}const pt=U("grl");class Bd{constructor(e,t){this.onCursorChange_=this.onCursorChange_.bind(this),this.onValueUpdate_=this.onValueUpdate_.bind(this),this.element=e.createElement("div"),this.element.classList.add(pt()),t.viewProps.bindClassModifiers(this.element),this.formatter_=t.formatter,this.props_=t.props,this.cursor_=t.cursor,this.cursor_.emitter.on("change",this.onCursorChange_);const a=e.createElementNS(Le,"svg");a.classList.add(pt("g")),a.style.height=`calc(var(${Ki("containerUnitSize")}) * ${t.rows})`,this.element.appendChild(a),this.svgElem_=a;const r=e.createElementNS(Le,"polyline");this.svgElem_.appendChild(r),this.lineElem_=r;const s=e.createElement("div");s.classList.add(pt("t"),U("tt")()),this.element.appendChild(s),this.tooltipElem_=s,t.value.emitter.on("change",this.onValueUpdate_),this.value=t.value,this.update_()}get graphElement(){return this.svgElem_}update_(){const{clientWidth:e,clientHeight:t}=this.element,a=this.value.rawValue.length-1,r=this.props_.get("min"),s=this.props_.get("max"),i=[];this.value.rawValue.forEach((d,m)=>{if(d===void 0)return;const b=z(m,0,a,0,e),_=z(d,r,s,t,0);i.push([b,_].join(","))}),this.lineElem_.setAttributeNS(null,"points",i.join(" "));const o=this.tooltipElem_,l=this.value.rawValue[this.cursor_.rawValue];if(l===void 0){o.classList.remove(pt("t","a"));return}const c=z(this.cursor_.rawValue,0,a,0,e),h=z(l,r,s,t,0);o.style.left=`${c}px`,o.style.top=`${h}px`,o.textContent=`${this.formatter_(l)}`,o.classList.contains(pt("t","a"))||(o.classList.add(pt("t","a"),pt("t","in")),ta(o),o.classList.remove(pt("t","in")))}onValueUpdate_(){this.update_()}onCursorChange_(){this.update_()}}class xo{constructor(e,t){if(this.onGraphMouseMove_=this.onGraphMouseMove_.bind(this),this.onGraphMouseLeave_=this.onGraphMouseLeave_.bind(this),this.onGraphPointerDown_=this.onGraphPointerDown_.bind(this),this.onGraphPointerMove_=this.onGraphPointerMove_.bind(this),this.onGraphPointerUp_=this.onGraphPointerUp_.bind(this),this.props=t.props,this.value=t.value,this.viewProps=t.viewProps,this.cursor_=Y(-1),this.view=new Bd(e,{cursor:this.cursor_,formatter:t.formatter,rows:t.rows,props:this.props,value:this.value,viewProps:this.viewProps}),!tr(e))this.view.element.addEventListener("mousemove",this.onGraphMouseMove_),this.view.element.addEventListener("mouseleave",this.onGraphMouseLeave_);else{const a=new kt(this.view.element);a.emitter.on("down",this.onGraphPointerDown_),a.emitter.on("move",this.onGraphPointerMove_),a.emitter.on("up",this.onGraphPointerUp_)}}importProps(e){return we(e,null,t=>({max:t.required.number,min:t.required.number}),t=>(this.props.set("max",t.max),this.props.set("min",t.min),!0))}exportProps(){return ye(null,{max:this.props.get("max"),min:this.props.get("min")})}onGraphMouseLeave_(){this.cursor_.rawValue=-1}onGraphMouseMove_(e){const{clientWidth:t}=this.view.element;this.cursor_.rawValue=Math.floor(z(e.offsetX,0,t,0,this.value.rawValue.length))}onGraphPointerDown_(e){this.onGraphPointerMove_(e)}onGraphPointerMove_(e){if(!e.data.point){this.cursor_.rawValue=-1;return}this.cursor_.rawValue=Math.floor(z(e.data.point.x,0,e.data.bounds.width,0,this.value.rawValue.length))}onGraphPointerUp_(){this.cursor_.rawValue=-1}}function Va(n){return q(n.format)?xe(2):n.format}function Od(n){var e;return n.value.rawValue.length===1?new Sr(n.document,{formatter:Va(n.params),value:n.value,viewProps:n.viewProps}):new xr(n.document,{formatter:Va(n.params),rows:(e=n.params.rows)!==null&&e!==void 0?e:On.monitor.defaultRows,value:n.value,viewProps:n.viewProps})}function Vd(n){var e,t,a;return new xo(n.document,{formatter:Va(n.params),rows:(e=n.params.rows)!==null&&e!==void 0?e:On.monitor.defaultRows,props:V.fromObject({max:(t=n.params.max)!==null&&t!==void 0?t:100,min:(a=n.params.min)!==null&&a!==void 0?a:0}),value:n.value,viewProps:n.viewProps})}function js(n){return n.view==="graph"}const Ld=be({id:"monitor-number",type:"monitor",accept:(n,e)=>{if(typeof n!="number")return null;const t=Q(e,a=>({format:a.optional.function,max:a.optional.number,min:a.optional.number,readonly:a.required.constant(!0),rows:a.optional.number,view:a.optional.string}));return t?{initialValue:n,params:t}:null},binding:{defaultBufferSize:n=>js(n)?64:1,reader:n=>Ti},controller:n=>js(n.params)?Vd(n):Od(n),api:n=>n.controller.valueController instanceof xo?new jd(n.controller):null}),Ud=be({id:"monitor-string",type:"monitor",accept:(n,e)=>{if(typeof n!="string")return null;const t=Q(e,a=>({multiline:a.optional.boolean,readonly:a.required.constant(!0),rows:a.optional.number}));return t?{initialValue:n,params:t}:null},binding:{reader:n=>zi},controller:n=>{var e;const t=n.value;return t.rawValue.length>1||n.params.multiline?new xr(n.document,{formatter:Oa,rows:(e=n.params.rows)!==null&&e!==void 0?e:On.monitor.defaultRows,value:t,viewProps:n.viewProps}):new Sr(n.document,{formatter:Oa,value:t,viewProps:n.viewProps})}});class Gd{constructor(){this.map_=new Map}get(e){var t;return(t=this.map_.get(e))!==null&&t!==void 0?t:null}has(e){return this.map_.has(e)}add(e,t){return this.map_.set(e,t),e.viewProps.handleDispose(()=>{this.map_.delete(e)}),t}}class Wd{constructor(e){this.target=e.target,this.reader_=e.reader,this.writer_=e.writer}read(){return this.reader_(this.target.read())}write(e){this.writer_(this.target,e)}inject(e){this.write(this.reader_(e))}}function zd(n,e){var t;const a=n.accept(e.target.read(),e.params);if(q(a))return null;const r={target:e.target,initialValue:a.initialValue,params:a.params},s=Q(e.params,d=>({disabled:d.optional.boolean,hidden:d.optional.boolean,label:d.optional.string,tag:d.optional.string})),i=n.binding.reader(r),o=n.binding.constraint?n.binding.constraint(r):void 0,l=new Wd({reader:i,target:e.target,writer:n.binding.writer(r)}),c=new Ic(Y(i(a.initialValue),{constraint:o,equals:n.binding.equals}),l),h=n.controller({constraint:o,document:e.document,initialValue:a.initialValue,params:a.params,value:c,viewProps:dt.create({disabled:s==null?void 0:s.disabled,hidden:s==null?void 0:s.hidden})});return new Gc(e.document,{blade:en(),props:V.fromObject({label:"label"in e.params?(t=s==null?void 0:s.label)!==null&&t!==void 0?t:null:e.target.key}),tag:s==null?void 0:s.tag,value:c,valueController:h})}class Hd{constructor(e){this.target=e.target,this.reader_=e.reader}read(){return this.reader_(this.target.read())}}function Xd(n,e){return e===0?new yu:new Eu(n,e??On.monitor.defaultInterval)}function Kd(n,e){var t,a,r;const s=n.accept(e.target.read(),e.params);if(q(s))return null;const i={target:e.target,initialValue:s.initialValue,params:s.params},o=Q(e.params,m=>({bufferSize:m.optional.number,disabled:m.optional.boolean,hidden:m.optional.boolean,interval:m.optional.number,label:m.optional.string})),l=n.binding.reader(i),c=(a=(t=o==null?void 0:o.bufferSize)!==null&&t!==void 0?t:n.binding.defaultBufferSize&&n.binding.defaultBufferSize(s.params))!==null&&a!==void 0?a:1,h=new Kc({binding:new Hd({reader:l,target:e.target}),bufferSize:c,ticker:Xd(e.document,o==null?void 0:o.interval)}),d=n.controller({document:e.document,params:s.params,value:h,viewProps:dt.create({disabled:o==null?void 0:o.disabled,hidden:o==null?void 0:o.hidden})});return d.viewProps.bindDisabled(h.ticker),d.viewProps.handleDispose(()=>{h.ticker.dispose()}),new Jc(e.document,{blade:en(),props:V.fromObject({label:"label"in e.params?(r=o==null?void 0:o.label)!==null&&r!==void 0?r:null:e.target.key}),value:h,valueController:d})}class qd{constructor(e){this.pluginsMap_={blades:[],inputs:[],monitors:[]},this.apiCache_=e}getAll(){return[...this.pluginsMap_.blades,...this.pluginsMap_.inputs,...this.pluginsMap_.monitors]}register(e,t){if(!Ou(t.core))throw te.notCompatible(e,t.id);t.type==="blade"?this.pluginsMap_.blades.unshift(t):t.type==="input"?this.pluginsMap_.inputs.unshift(t):t.type==="monitor"&&this.pluginsMap_.monitors.unshift(t)}createInput_(e,t,a){return this.pluginsMap_.inputs.reduce((r,s)=>r??zd(s,{document:e,target:t,params:a}),null)}createMonitor_(e,t,a){return this.pluginsMap_.monitors.reduce((r,s)=>r??Kd(s,{document:e,params:a,target:t}),null)}createBinding(e,t,a){const r=t.read();if(q(r))throw new te({context:{key:t.key},type:"nomatchingcontroller"});const s=this.createInput_(e,t,a);if(s)return s;const i=this.createMonitor_(e,t,a);if(i)return i;throw new te({context:{key:t.key},type:"nomatchingcontroller"})}createBlade(e,t){const a=this.pluginsMap_.blades.reduce((r,s)=>r??wu(s,{document:e,params:t}),null);if(!a)throw new te({type:"nomatchingview",context:{params:t}});return a}createInputBindingApi_(e){const t=this.pluginsMap_.inputs.reduce((a,r)=>{var s,i;return a||((i=(s=r.api)===null||s===void 0?void 0:s.call(r,{controller:e}))!==null&&i!==void 0?i:null)},null);return this.apiCache_.add(e,t??new xn(e))}createMonitorBindingApi_(e){const t=this.pluginsMap_.monitors.reduce((a,r)=>{var s,i;return a||((i=(s=r.api)===null||s===void 0?void 0:s.call(r,{controller:e}))!==null&&i!==void 0?i:null)},null);return this.apiCache_.add(e,t??new xn(e))}createBindingApi(e){if(this.apiCache_.has(e))return this.apiCache_.get(e);if(Wc(e))return this.createInputBindingApi_(e);if(Yc(e))return this.createMonitorBindingApi_(e);throw te.shouldNeverHappen()}createApi(e){if(this.apiCache_.has(e))return this.apiCache_.get(e);if(Uc(e))return this.createBindingApi(e);const t=this.pluginsMap_.blades.reduce((a,r)=>a??r.api({controller:e,pool:this}),null);if(!t)throw te.shouldNeverHappen();return this.apiCache_.add(e,t)}}const Jd=new Gd;function Yd(){const n=new qd(Jd);return[Td,Cd,Dd,Pd,dd,od,id,td,Gu,Nd,Ud,Ld,tu,fu,Ui].forEach(e=>{n.register("core",e)}),n}class $d extends Ft{constructor(e){super(e),this.emitter_=new ae,this.controller.value.emitter.on("change",t=>{this.emitter_.emit("change",new Dn(this,t.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get options(){return this.controller.valueController.props.get("options")}set options(e){this.controller.valueController.props.set("options",e)}get value(){return this.controller.value.rawValue}set value(e){this.controller.value.rawValue=e}on(e,t){const a=t.bind(this);return this.emitter_.on(e,r=>{a(r)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}class Qd extends Ft{}class Zd extends Ft{constructor(e){super(e),this.emitter_=new ae,this.controller.value.emitter.on("change",t=>{this.emitter_.emit("change",new Dn(this,t.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get max(){return this.controller.valueController.sliderController.props.get("max")}set max(e){this.controller.valueController.sliderController.props.set("max",e)}get min(){return this.controller.valueController.sliderController.props.get("min")}set min(e){this.controller.valueController.sliderController.props.set("min",e)}get value(){return this.controller.value.rawValue}set value(e){this.controller.value.rawValue=e}on(e,t){const a=t.bind(this);return this.emitter_.on(e,r=>{a(r)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}class eh extends Ft{constructor(e){super(e),this.emitter_=new ae,this.controller.value.emitter.on("change",t=>{this.emitter_.emit("change",new Dn(this,t.rawValue))})}get label(){return this.controller.labelController.props.get("label")}set label(e){this.controller.labelController.props.set("label",e)}get formatter(){return this.controller.valueController.props.get("formatter")}set formatter(e){this.controller.valueController.props.set("formatter",e)}get value(){return this.controller.value.rawValue}set value(e){this.controller.value.rawValue=e}on(e,t){const a=t.bind(this);return this.emitter_.on(e,r=>{a(r)},{key:t}),this}off(e,t){return this.emitter_.off(e,t),this}}const th=(function(){return{id:"list",type:"blade",core:Zt,accept(n){const e=Q(n,t=>({options:t.required.custom(kn),value:t.required.raw,view:t.required.constant("list"),label:t.optional.string}));return e?{params:e}:null},controller(n){const e=new Fn(cr(n.params.options)),t=Y(n.params.value,{constraint:e}),a=new Tt(n.document,{props:new V({options:e.values.value("options")}),value:t,viewProps:n.viewProps});return new Dt(n.document,{blade:n.blade,props:V.fromObject({label:n.params.label}),value:t,valueController:a})},api(n){return!(n.controller instanceof Dt)||!(n.controller.valueController instanceof Tt)?null:new $d(n.controller)}}})();class nh extends Vi{constructor(e,t){super(e,t)}get element(){return this.controller.view.element}}class ah extends ja{constructor(e,t){super(e,{expanded:t.expanded,blade:t.blade,props:t.props,root:!0,viewProps:t.viewProps})}}const Bs=U("spr");class rh{constructor(e,t){this.element=e.createElement("div"),this.element.classList.add(Bs()),t.viewProps.bindClassModifiers(this.element);const a=e.createElement("hr");a.classList.add(Bs("r")),this.element.appendChild(a)}}class Os extends fa{constructor(e,t){super(Object.assign(Object.assign({},t),{view:new rh(e,{viewProps:t.viewProps})}))}}const sh={id:"separator",type:"blade",core:Zt,accept(n){const e=Q(n,t=>({view:t.required.constant("separator")}));return e?{params:e}:null},controller(n){return new Os(n.document,{blade:n.blade,viewProps:n.viewProps})},api(n){return n.controller instanceof Os?new Qd(n.controller):null}},ih={id:"slider",type:"blade",core:Zt,accept(n){const e=Q(n,t=>({max:t.required.number,min:t.required.number,view:t.required.constant("slider"),format:t.optional.function,label:t.optional.string,value:t.optional.number}));return e?{params:e}:null},controller(n){var e,t;const a=(e=n.params.value)!==null&&e!==void 0?e:0,r=new An({max:n.params.max,min:n.params.min}),s=Y(a,{constraint:r}),i=new ra(n.document,Object.assign(Object.assign({},Xi({formatter:(t=n.params.format)!==null&&t!==void 0?t:Tc,keyScale:Y(1),max:r.values.value("max"),min:r.values.value("min"),pointerScale:Ei(n.params,a)})),{parser:ut,value:s,viewProps:n.viewProps}));return new Dt(n.document,{blade:n.blade,props:V.fromObject({label:n.params.label}),value:s,valueController:i})},api(n){return!(n.controller instanceof Dt)||!(n.controller.valueController instanceof ra)?null:new Zd(n.controller)}},oh=(function(){return{id:"text",type:"blade",core:Zt,accept(n){const e=Q(n,t=>({parse:t.required.function,value:t.required.raw,view:t.required.constant("text"),format:t.optional.function,label:t.optional.string}));return e?{params:e}:null},controller(n){var e;const t=Y(n.params.value),a=new Sn(n.document,{parser:n.params.parse,props:V.fromObject({formatter:(e=n.params.format)!==null&&e!==void 0?e:(r=>String(r))}),value:t,viewProps:n.viewProps});return new Dt(n.document,{blade:n.blade,props:V.fromObject({label:n.params.label}),value:t,valueController:a})},api(n){return!(n.controller instanceof Dt)||!(n.controller.valueController instanceof Sn)?null:new eh(n.controller)}}})();function lh(n){const e=n.createElement("div");return e.classList.add(U("dfw")()),n.body&&n.body.appendChild(e),e}function ch(n,e,t){if(n.querySelector(`style[data-tp-style=${e}]`))return;const a=n.createElement("style");a.dataset.tpStyle=e,a.textContent=t,n.head.appendChild(a)}class l0 extends nh{constructor(e){var t,a;const r=e??{},s=(t=r.document)!==null&&t!==void 0?t:kc(),i=Yd(),o=new ah(s,{expanded:r.expanded,blade:en(),props:V.fromObject({title:r.title}),viewProps:dt.create()});super(o,i),this.pool_=i,this.containerElem_=(a=r.container)!==null&&a!==void 0?a:lh(s),this.containerElem_.appendChild(this.element),this.doc_=s,this.usesDefaultWrapper_=!r.container,this.setUpDefaultPlugins_()}get document(){if(!this.doc_)throw te.alreadyDisposed();return this.doc_}dispose(){const e=this.containerElem_;if(!e)throw te.alreadyDisposed();if(this.usesDefaultWrapper_){const t=e.parentElement;t&&t.removeChild(e)}this.containerElem_=null,this.doc_=null,super.dispose()}registerPlugin(e){e.css&&ch(this.document,`plugin-${e.id}`,e.css),("plugin"in e?[e.plugin]:"plugins"in e?e.plugins:[]).forEach(a=>{this.pool_.register(e.id,a)})}setUpDefaultPlugins_(){this.registerPlugin({id:"default",css:'.tp-tbiv_b,.tp-coltxtv_ms,.tp-colswv_b,.tp-ckbv_i,.tp-sglv_i,.tp-mllv_i,.tp-grlv_g,.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw,.tp-rotv_b,.tp-fldv_b,.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:rgba(0,0,0,0);border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{background-color:var(--btn-bg);border-radius:var(--bld-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--cnt-usz);line-height:var(--cnt-usz);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-p2dv_b:hover,.tp-btnv_b:hover,.tp-lstv_s:hover{background-color:var(--btn-bg-h)}.tp-p2dv_b:focus,.tp-btnv_b:focus,.tp-lstv_s:focus{background-color:var(--btn-bg-f)}.tp-p2dv_b:active,.tp-btnv_b:active,.tp-lstv_s:active{background-color:var(--btn-bg-a)}.tp-p2dv_b:disabled,.tp-btnv_b:disabled,.tp-lstv_s:disabled{opacity:.5}.tp-rotv_c>.tp-cntv.tp-v-lst,.tp-tbpv_c>.tp-cntv.tp-v-lst,.tp-fldv_c>.tp-cntv.tp-v-lst{margin-bottom:calc(-1*var(--cnt-vp))}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c{border-bottom-left-radius:0}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b{border-bottom-left-radius:0}.tp-rotv_c>*:not(.tp-v-fst),.tp-tbpv_c>*:not(.tp-v-fst),.tp-fldv_c>*:not(.tp-v-fst){margin-top:var(--cnt-usp)}.tp-rotv_c>.tp-sprv:not(.tp-v-fst),.tp-tbpv_c>.tp-sprv:not(.tp-v-fst),.tp-fldv_c>.tp-sprv:not(.tp-v-fst),.tp-rotv_c>.tp-cntv:not(.tp-v-fst),.tp-tbpv_c>.tp-cntv:not(.tp-v-fst),.tp-fldv_c>.tp-cntv:not(.tp-v-fst){margin-top:var(--cnt-vp)}.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-tbpv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-tbpv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden){margin-top:var(--cnt-vp)}.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-tbpv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-tbpv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv{margin-top:0}.tp-tbpv_c>.tp-cntv,.tp-fldv_c>.tp-cntv{margin-left:4px}.tp-tbpv_c>.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-fldv>.tp-fldv_b{border-top-left-radius:var(--bld-br);border-bottom-left-radius:var(--bld-br)}.tp-tbpv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b{border-bottom-left-radius:0}.tp-tbpv_c .tp-fldv>.tp-fldv_c,.tp-fldv_c .tp-fldv>.tp-fldv_c{border-bottom-left-radius:var(--bld-br)}.tp-tbpv_c>.tp-cntv+.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-cntv+.tp-fldv>.tp-fldv_b{border-top-left-radius:0}.tp-tbpv_c>.tp-cntv+.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-cntv+.tp-tabv>.tp-tabv_t{border-top-left-radius:0}.tp-tbpv_c>.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-tabv>.tp-tabv_t{border-top-left-radius:var(--bld-br)}.tp-tbpv_c .tp-tabv>.tp-tabv_c,.tp-fldv_c .tp-tabv>.tp-tabv_c{border-bottom-left-radius:var(--bld-br)}.tp-rotv_b,.tp-fldv_b{background-color:var(--cnt-bg);color:var(--cnt-fg);cursor:pointer;display:block;height:calc(var(--cnt-usz) + 4px);line-height:calc(var(--cnt-usz) + 4px);overflow:hidden;padding-left:var(--cnt-hp);padding-right:calc(4px + var(--cnt-usz) + var(--cnt-hp));position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-rotv_b:hover,.tp-fldv_b:hover{background-color:var(--cnt-bg-h)}.tp-rotv_b:focus,.tp-fldv_b:focus{background-color:var(--cnt-bg-f)}.tp-rotv_b:active,.tp-fldv_b:active{background-color:var(--cnt-bg-a)}.tp-rotv_b:disabled,.tp-fldv_b:disabled{opacity:.5}.tp-rotv_m,.tp-fldv_m{background:linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);border-radius:2px;bottom:0;content:"";display:block;height:6px;right:calc(var(--cnt-hp) + (var(--cnt-usz) + 4px - 6px)/2 - 2px);margin:auto;opacity:.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-rotv.tp-rotv-expanded .tp-rotv_m,.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m{transform:none}.tp-rotv_c,.tp-fldv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c,.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c{display:none}.tp-rotv.tp-rotv-expanded .tp-rotv_c,.tp-fldv.tp-fldv-expanded>.tp-fldv_c{opacity:1;padding-bottom:var(--cnt-vp);padding-top:var(--cnt-vp);transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw{background-color:var(--in-bg);border-radius:var(--bld-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--cnt-usz);line-height:var(--cnt-usz);min-width:0;width:100%}.tp-txtv_i:hover,.tp-p2dpv_p:hover,.tp-colswv_sw:hover{background-color:var(--in-bg-h)}.tp-txtv_i:focus,.tp-p2dpv_p:focus,.tp-colswv_sw:focus{background-color:var(--in-bg-f)}.tp-txtv_i:active,.tp-p2dpv_p:active,.tp-colswv_sw:active{background-color:var(--in-bg-a)}.tp-txtv_i:disabled,.tp-p2dpv_p:disabled,.tp-colswv_sw:disabled{opacity:.5}.tp-lstv,.tp-coltxtv_m{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m,.tp-coltxtv_mm{bottom:0;margin:auto;pointer-events:none;position:absolute;right:2px;top:0}.tp-lstv_m svg,.tp-coltxtv_mm svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-lstv_m svg path,.tp-coltxtv_mm svg path{fill:currentColor}.tp-sglv_i,.tp-mllv_i,.tp-grlv_g{background-color:var(--mo-bg);border-radius:var(--bld-br);box-sizing:border-box;color:var(--mo-fg);height:var(--cnt-usz);scrollbar-color:currentColor rgba(0,0,0,0);scrollbar-width:thin;width:100%}.tp-sglv_i::-webkit-scrollbar,.tp-mllv_i::-webkit-scrollbar,.tp-grlv_g::-webkit-scrollbar{height:8px;width:8px}.tp-sglv_i::-webkit-scrollbar-corner,.tp-mllv_i::-webkit-scrollbar-corner,.tp-grlv_g::-webkit-scrollbar-corner{background-color:rgba(0,0,0,0)}.tp-sglv_i::-webkit-scrollbar-thumb,.tp-mllv_i::-webkit-scrollbar-thumb,.tp-grlv_g::-webkit-scrollbar-thumb{background-clip:padding-box;background-color:currentColor;border:rgba(0,0,0,0) solid 2px;border-radius:4px}.tp-pndtxtv,.tp-coltxtv_w{display:flex}.tp-pndtxtv_a,.tp-coltxtv_c{width:100%}.tp-pndtxtv_a+.tp-pndtxtv_a,.tp-coltxtv_c+.tp-pndtxtv_a,.tp-pndtxtv_a+.tp-coltxtv_c,.tp-coltxtv_c+.tp-coltxtv_c{margin-left:2px}.tp-rotv{--bs-bg: var(--tp-base-background-color, hsl(230, 7%, 17%));--bs-br: var(--tp-base-border-radius, 6px);--bs-ff: var(--tp-base-font-family, Roboto Mono, Source Code Pro, Menlo, Courier, monospace);--bs-sh: var(--tp-base-shadow-color, rgba(0, 0, 0, 0.2));--bld-br: var(--tp-blade-border-radius, 2px);--bld-hp: var(--tp-blade-horizontal-padding, 4px);--bld-vw: var(--tp-blade-value-width, 160px);--btn-bg: var(--tp-button-background-color, hsl(230, 7%, 70%));--btn-bg-a: var(--tp-button-background-color-active, #d6d7db);--btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);--btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);--btn-fg: var(--tp-button-foreground-color, hsl(230, 7%, 17%));--cnt-bg: var(--tp-container-background-color, rgba(187, 188, 196, 0.1));--cnt-bg-a: var(--tp-container-background-color-active, rgba(187, 188, 196, 0.25));--cnt-bg-f: var(--tp-container-background-color-focus, rgba(187, 188, 196, 0.2));--cnt-bg-h: var(--tp-container-background-color-hover, rgba(187, 188, 196, 0.15));--cnt-fg: var(--tp-container-foreground-color, hsl(230, 7%, 75%));--cnt-hp: var(--tp-container-horizontal-padding, 4px);--cnt-vp: var(--tp-container-vertical-padding, 4px);--cnt-usp: var(--tp-container-unit-spacing, 4px);--cnt-usz: var(--tp-container-unit-size, 20px);--in-bg: var(--tp-input-background-color, rgba(187, 188, 196, 0.1));--in-bg-a: var(--tp-input-background-color-active, rgba(187, 188, 196, 0.25));--in-bg-f: var(--tp-input-background-color-focus, rgba(187, 188, 196, 0.2));--in-bg-h: var(--tp-input-background-color-hover, rgba(187, 188, 196, 0.15));--in-fg: var(--tp-input-foreground-color, hsl(230, 7%, 75%));--lbl-fg: var(--tp-label-foreground-color, rgba(187, 188, 196, 0.7));--mo-bg: var(--tp-monitor-background-color, rgba(0, 0, 0, 0.2));--mo-fg: var(--tp-monitor-foreground-color, rgba(187, 188, 196, 0.7));--grv-fg: var(--tp-groove-foreground-color, rgba(187, 188, 196, 0.1))}.tp-btnv_b{width:100%}.tp-btnv_t{text-align:center}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--in-bg);border-radius:var(--bld-br);cursor:pointer;display:block;height:var(--cnt-usz);position:relative;width:var(--cnt-usz)}.tp-ckbv_w svg{display:block;height:16px;inset:0;margin:auto;opacity:0;position:absolute;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--in-fg);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--in-bg-h)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--in-bg-f)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--in-bg-a)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-ckbv.tp-v-disabled .tp-ckbv_w{opacity:.5}.tp-colv{position:relative}.tp-colv_h{display:flex}.tp-colv_s{flex-grow:0;flex-shrink:0;width:var(--cnt-usz)}.tp-colv_t{flex:1;margin-left:4px}.tp-colv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-colv.tp-colv-expanded.tp-colv-cpl .tp-colv_p{overflow:visible}.tp-colv.tp-colv-expanded .tp-colv_p{margin-top:var(--cnt-usp);opacity:1}.tp-colv .tp-popv{left:calc(-1*var(--cnt-hp));right:calc(-1*var(--cnt-hp));top:var(--cnt-usz)}.tp-colpv_h,.tp-colpv_ap{margin-left:6px;margin-right:6px}.tp-colpv_h{margin-top:var(--cnt-usp)}.tp-colpv_rgb{display:flex;margin-top:var(--cnt-usp);width:100%}.tp-colpv_a{display:flex;margin-top:var(--cnt-vp);padding-top:calc(var(--cnt-vp) + 2px);position:relative}.tp-colpv_a::before{background-color:var(--grv-fg);content:"";height:2px;left:calc(-1*var(--cnt-hp));position:absolute;right:calc(-1*var(--cnt-hp));top:0}.tp-colpv.tp-v-disabled .tp-colpv_a::before{opacity:.5}.tp-colpv_ap{align-items:center;display:flex;flex:3}.tp-colpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:var(--bld-br);outline:none;overflow:hidden;position:relative}.tp-svpv.tp-v-disabled{opacity:.5}.tp-svpv_c{cursor:crosshair;display:block;height:calc(var(--cnt-usz)*4);width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--cnt-usz);outline:none;position:relative}.tp-hplv.tp-v-disabled{opacity:.5}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:var(--bld-br);border:rgba(255,255,255,.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--cnt-usz);outline:none;position:relative;width:100%}.tp-aplv.tp-v-disabled{opacity:.5}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{inset:0;position:absolute}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:var(--bld-br);box-shadow:0 0 2px rgba(0,0,0,.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:var(--bld-br);border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;inset:0;position:absolute}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-colswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:var(--bld-br);overflow:hidden}.tp-colswv.tp-v-disabled{opacity:.5}.tp-colswv_sw{border-radius:0}.tp-colswv_b{cursor:pointer;display:block;height:var(--cnt-usz);left:0;position:absolute;top:0;width:var(--cnt-usz)}.tp-colswv_b:focus::after{border:rgba(255,255,255,.75) solid 2px;border-radius:var(--bld-br);content:"";display:block;inset:0;position:absolute}.tp-coltxtv{display:flex;width:100%}.tp-coltxtv_m{margin-right:4px}.tp-coltxtv_ms{border-radius:var(--bld-br);color:var(--lbl-fg);cursor:pointer;height:var(--cnt-usz);line-height:var(--cnt-usz);padding:0 18px 0 4px}.tp-coltxtv_ms:hover{background-color:var(--in-bg-h)}.tp-coltxtv_ms:focus{background-color:var(--in-bg-f)}.tp-coltxtv_ms:active{background-color:var(--in-bg-a)}.tp-coltxtv_mm{color:var(--lbl-fg)}.tp-coltxtv.tp-v-disabled .tp-coltxtv_mm{opacity:.5}.tp-coltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:256px}.tp-fldv{position:relative}.tp-fldv_t{padding-left:4px}.tp-fldv_b:disabled .tp-fldv_m{display:none}.tp-fldv_c{padding-left:4px}.tp-fldv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--cnt-usz) + 4px);width:max(var(--bs-br),4px)}.tp-fldv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-fldv_b:hover+.tp-fldv_i{color:var(--cnt-bg-h)}.tp-fldv_b:focus+.tp-fldv_i{color:var(--cnt-bg-f)}.tp-fldv_b:active+.tp-fldv_i{color:var(--cnt-bg-a)}.tp-fldv.tp-v-disabled>.tp-fldv_i{opacity:.5}.tp-grlv{position:relative}.tp-grlv_g{display:block;height:calc(var(--cnt-usz)*3)}.tp-grlv_g polyline{fill:none;stroke:var(--mo-fg);stroke-linejoin:round}.tp-grlv_t{margin-top:-4px;transition:left .05s,top .05s;visibility:hidden}.tp-grlv_t.tp-grlv_t-a{visibility:visible}.tp-grlv_t.tp-grlv_t-in{transition:none}.tp-grlv.tp-v-disabled .tp-grlv_g{opacity:.5}.tp-grlv .tp-ttv{background-color:var(--mo-fg)}.tp-grlv .tp-ttv::before{border-top-color:var(--mo-fg)}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:var(--cnt-hp);padding-right:var(--cnt-hp)}.tp-lblv.tp-lblv-nol{display:block}.tp-lblv_l{color:var(--lbl-fg);flex:1;-webkit-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv.tp-v-disabled .tp-lblv_l{opacity:.5}.tp-lblv.tp-lblv-nol .tp-lblv_l{display:none}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:var(--bld-vw)}.tp-lblv.tp-lblv-nol .tp-lblv_v{width:100%}.tp-lstv_s{padding:0 20px 0 var(--bld-hp);width:100%}.tp-lstv_m{color:var(--btn-fg)}.tp-sglv_i{padding-left:var(--bld-hp);padding-right:var(--bld-hp)}.tp-sglv.tp-v-disabled .tp-sglv_i{opacity:.5}.tp-mllv_i{display:block;height:calc(var(--cnt-usz)*3);line-height:var(--cnt-usz);padding-left:var(--bld-hp);padding-right:var(--bld-hp);resize:none;white-space:pre}.tp-mllv.tp-v-disabled .tp-mllv_i{opacity:.5}.tp-p2dv{position:relative}.tp-p2dv_h{display:flex}.tp-p2dv_b{height:var(--cnt-usz);margin-right:4px;position:relative;width:var(--cnt-usz)}.tp-p2dv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dv_b svg circle{fill:currentColor}.tp-p2dv_t{flex:1}.tp-p2dv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p{margin-top:var(--cnt-usp);opacity:1}.tp-p2dv .tp-popv{left:calc(-1*var(--cnt-hp));right:calc(-1*var(--cnt-hp));top:var(--cnt-usz)}.tp-p2dpv{padding-left:calc(var(--cnt-usz) + 4px)}.tp-p2dpv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpv.tp-v-disabled .tp-p2dpv_p{opacity:.5}.tp-p2dpv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpv_ax{opacity:.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_l{opacity:.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_m{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;position:absolute;width:4px}.tp-p2dpv_p:focus .tp-p2dpv_m{background-color:var(--in-fg);border-width:0}.tp-popv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);display:none;max-width:var(--bld-vw);padding:var(--cnt-vp) var(--cnt-hp);position:absolute;visibility:hidden;z-index:1000}.tp-popv.tp-popv-v{display:block;visibility:visible}.tp-sldv.tp-v-disabled{opacity:.5}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--cnt-usz);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--in-bg);border-radius:1px;content:"";display:block;height:2px;inset:0;margin:auto;position:absolute}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--in-fg);border-radius:1px;content:"";display:block;height:2px;inset:0;margin-bottom:auto;margin-top:auto;position:absolute}.tp-sldv_k::after{background-color:var(--btn-bg);border-radius:var(--bld-br);bottom:0;content:"";display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--btn-bg-h)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--btn-bg-f)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--btn-bg-a)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-tabv{position:relative}.tp-tabv_t{align-items:flex-end;color:var(--cnt-bg);display:flex;overflow:hidden;position:relative}.tp-tabv_t:hover{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus){color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active){color:var(--cnt-bg-a)}.tp-tabv_t::before{background-color:currentColor;bottom:0;content:"";height:2px;left:0;pointer-events:none;position:absolute;right:0}.tp-tabv.tp-v-disabled .tp-tabv_t::before{opacity:.5}.tp-tabv.tp-tabv-nop .tp-tabv_t{height:calc(var(--cnt-usz) + 4px);position:relative}.tp-tabv.tp-tabv-nop .tp-tabv_t::before{background-color:var(--cnt-bg);bottom:0;content:"";height:2px;left:0;position:absolute;right:0}.tp-tabv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--cnt-usz) + 4px);width:max(var(--bs-br),4px)}.tp-tabv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-tabv_t:hover+.tp-tabv_i{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus)+.tp-tabv_i{color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active)+.tp-tabv_i{color:var(--cnt-bg-a)}.tp-tabv.tp-v-disabled>.tp-tabv_i{opacity:.5}.tp-tbiv{flex:1;min-width:0;position:relative}.tp-tbiv+.tp-tbiv{margin-left:2px}.tp-tbiv+.tp-tbiv.tp-v-disabled::before{opacity:.5}.tp-tbiv_b{display:block;padding-left:calc(var(--cnt-hp) + 4px);padding-right:calc(var(--cnt-hp) + 4px);position:relative;width:100%}.tp-tbiv_b:disabled{opacity:.5}.tp-tbiv_b::before{background-color:var(--cnt-bg);content:"";inset:0 0 2px;pointer-events:none;position:absolute}.tp-tbiv_b:hover::before{background-color:var(--cnt-bg-h)}.tp-tbiv_b:focus::before{background-color:var(--cnt-bg-f)}.tp-tbiv_b:active::before{background-color:var(--cnt-bg-a)}.tp-tbiv_t{color:var(--cnt-fg);height:calc(var(--cnt-usz) + 4px);line-height:calc(var(--cnt-usz) + 4px);opacity:.5;overflow:hidden;position:relative;text-overflow:ellipsis}.tp-tbiv.tp-tbiv-sel .tp-tbiv_t{opacity:1}.tp-tbpv_c{padding-bottom:var(--cnt-vp);padding-left:4px;padding-top:var(--cnt-vp)}.tp-txtv{position:relative}.tp-txtv_i{padding-left:var(--bld-hp);padding-right:var(--bld-hp)}.tp-txtv.tp-txtv-fst .tp-txtv_i{border-bottom-right-radius:0;border-top-right-radius:0}.tp-txtv.tp-txtv-mid .tp-txtv_i{border-radius:0}.tp-txtv.tp-txtv-lst .tp-txtv_i{border-bottom-left-radius:0;border-top-left-radius:0}.tp-txtv.tp-txtv-num .tp-txtv_i{text-align:right}.tp-txtv.tp-txtv-drg .tp-txtv_i{opacity:.3}.tp-txtv_k{cursor:pointer;height:100%;left:calc(var(--bld-hp) - 5px);position:absolute;top:0;width:12px}.tp-txtv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:"";height:calc(var(--cnt-usz) - 4px);left:50%;margin-bottom:auto;margin-left:-1px;margin-top:auto;opacity:.1;position:absolute;top:0;transition:border-radius .1s,height .1s,transform .1s,width .1s;width:2px}.tp-txtv_k:hover::before,.tp-txtv.tp-txtv-drg .tp-txtv_k::before{opacity:1}.tp-txtv.tp-txtv-drg .tp-txtv_k::before{border-radius:50%;height:4px;transform:translateX(-1px);width:4px}.tp-txtv_g{bottom:0;display:block;height:8px;left:50%;margin:auto;overflow:visible;pointer-events:none;position:absolute;top:0;visibility:hidden;width:100%}.tp-txtv.tp-txtv-drg .tp-txtv_g{visibility:visible}.tp-txtv_gb{fill:none;stroke:var(--in-fg);stroke-dasharray:1}.tp-txtv_gh{fill:none;stroke:var(--in-fg)}.tp-txtv .tp-ttv{margin-left:6px;visibility:hidden}.tp-txtv.tp-txtv-drg .tp-ttv{visibility:visible}.tp-ttv{background-color:var(--in-fg);border-radius:var(--bld-br);color:var(--bs-bg);padding:2px 4px;pointer-events:none;position:absolute;transform:translate(-50%, -100%)}.tp-ttv::before{border-color:var(--in-fg) rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0);border-style:solid;border-width:2px;box-sizing:border-box;content:"";font-size:.9em;height:4px;left:50%;margin-left:-2px;position:absolute;top:100%;width:4px}.tp-rotv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);font-family:var(--bs-ff);font-size:11px;font-weight:500;line-height:1;text-align:left}.tp-rotv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br);border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br);padding-left:calc(4px + var(--cnt-usz) + var(--cnt-hp));text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_b{border-bottom-left-radius:0;border-bottom-right-radius:0;transition-delay:0s;transition-duration:0s}.tp-rotv.tp-rotv-not>.tp-rotv_b{display:none}.tp-rotv_b:disabled .tp-rotv_m{display:none}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst.tp-fldv-expanded>.tp-fldv_b{transition-delay:0s;transition-duration:0s}.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst{margin-top:calc(-1*var(--cnt-vp))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst{margin-top:calc(-1*var(--cnt-vp))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_t{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-v-disabled,.tp-rotv .tp-v-disabled{pointer-events:none}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}.tp-sprv_r{background-color:var(--grv-fg);border-width:0;display:block;height:2px;margin:0;width:100%}.tp-sprv.tp-v-disabled .tp-sprv_r{opacity:.5}',plugins:[th,sh,ih,Ui,oh]})}}new Oi("4.0.5");const uh="modulepreload",_h=function(n){return"/"+n},Vs={},dh=function(e,t,a){let r=Promise.resolve();if(t&&t.length>0){let i=function(c){return Promise.all(c.map(h=>Promise.resolve(h).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));r=i(t.map(c=>{if(c=_h(c),c in Vs)return;Vs[c]=!0;const h=c.endsWith(".css"),d=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${d}`))return;const m=document.createElement("link");if(m.rel=h?"stylesheet":uh,h||(m.as="script"),m.crossOrigin="",m.href=c,l&&m.setAttribute("nonce",l),document.head.appendChild(m),h)return new Promise((b,_)=>{m.addEventListener("load",b),m.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(i){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=i,window.dispatchEvent(o),!o.defaultPrevented)throw i}return r.then(i=>{for(const o of i||[])o.status==="rejected"&&s(o.reason);return e().catch(s)})};let Ia;async function So(){return Ia||(Ia=(async()=>{try{const n=await dh(()=>import("./tinybvh_builder-3WCoxPls.js"),[]);return typeof n.default!="function"?null:await n.default({noInitialRun:!0})}catch{return null}})()),Ia}async function hh(n,e){const t=await So();if(!t)throw new Error("TinyBVH WASM module failed to load");if(n.length%e!==0)throw new Error(`TinyBVH: incompatible vertex stride ${e} for ${n.length} floats`);const a=n.length/e;if(a%3!==0)throw new Error(`TinyBVH: incomplete triangle stream with ${a} vertices`);const r=n.byteLength,s=t._alloc_buffer(r),i=t.HEAPU8.buffer.byteLength,o=s+r;if(!Number.isFinite(s)||s<0||o>i)throw new Error(`TinyBVH: buffer allocation failed for ${r} bytes (ptr=${s}, memory=${i})`);let l=0;const c=performance.now();try{t.HEAPU8.set(new Uint8Array(n.buffer,n.byteOffset,n.byteLength),s);try{l=t._build_bvh(s,n.length,e)}catch(x){const T=x instanceof Error?x.message:String(x);throw new Error(`TinyBVH wasm trapped while building ${Math.floor(a/3)} triangles from ${r} bytes: ${T}`)}const h=t._get_last_error_len();if(h>0){const x=t._get_last_error_ptr(),T=x>=0&&x+h<=t.HEAPU8.buffer.byteLength?new TextDecoder().decode(t.HEAPU8.subarray(x,x+h)):"unknown native error";throw new Error(`TinyBVH build failed: ${T}`)}if(!l)throw new Error("TinyBVH build failed without native error details");const d=t._get_bvh_nodes_ptr(),m=t._get_bvh_nodes_len(),b=t._get_bvh_indices_ptr(),_=t._get_bvh_indices_len(),p=t.HEAPU8.buffer.byteLength,v=d+m*Float32Array.BYTES_PER_ELEMENT,u=b+_*Int32Array.BYTES_PER_ELEMENT;if(d<0||v>p)throw new Error(`TinyBVH returned out-of-bounds node buffer (ptr=${d}, len=${m}, memory=${p})`);if(b<0||u>p)throw new Error(`TinyBVH returned out-of-bounds index buffer (ptr=${b}, len=${_}, memory=${p})`);const S=new Float32Array(m);new Uint8Array(S.buffer).set(t.HEAPU8.subarray(d,d+m*Float32Array.BYTES_PER_ELEMENT));const g=new Int32Array(_);return new Uint8Array(g.buffer).set(t.HEAPU8.subarray(b,b+_*Int32Array.BYTES_PER_ELEMENT)),{nodeData:S,triangleIndices:g,stats:{nodeCount:t._get_bvh_node_count(),triangleCount:t._get_bvh_triangle_count(),buildTimeMs:performance.now()-c}}}finally{t._free_buffer(s)}}async function fh(n,e){const t=await So();if(!t)throw new Error("TinyBVH WASM module failed to load");if(n.length%3!==0)throw new Error(`TinyBVH: position buffer must be packed float3, got ${n.length} floats`);if(e.length%3!==0)throw new Error(`TinyBVH: index buffer does not describe whole triangles, got ${e.length} indices`);const a=t._alloc_buffer(n.byteLength),r=t._alloc_buffer(e.byteLength),s=t.HEAPU8.buffer.byteLength,i=a+n.byteLength,o=r+e.byteLength;if(!Number.isFinite(a)||a<0||i>s)throw r&&t._free_buffer(r),new Error(`TinyBVH: position allocation failed for ${n.byteLength} bytes (ptr=${a}, memory=${s})`);if(!Number.isFinite(r)||r<0||o>s)throw t._free_buffer(a),new Error(`TinyBVH: index allocation failed for ${e.byteLength} bytes (ptr=${r}, memory=${s})`);let l=0;const c=performance.now();try{t.HEAPU8.set(new Uint8Array(n.buffer,n.byteOffset,n.byteLength),a),t.HEAPU8.set(new Uint8Array(e.buffer,e.byteOffset,e.byteLength),r);try{l=t._build_bvh_indexed(a,n.length,r,e.length)}catch(d){const m=d instanceof Error?d.message:String(d);throw new Error(`TinyBVH wasm trapped while building indexed BVH for ${Math.floor(e.length/3)} triangles from ${n.byteLength+e.byteLength} bytes: ${m}`)}const h=t._get_last_error_len();if(h>0){const d=t._get_last_error_ptr(),m=d>=0&&d+h<=t.HEAPU8.buffer.byteLength?new TextDecoder().decode(t.HEAPU8.subarray(d,d+h)):"unknown native error";throw new Error(`TinyBVH indexed build failed: ${m}`)}if(!l)throw new Error("TinyBVH indexed build failed without native error details");return ph(t,performance.now()-c)}finally{t._free_buffer(a),t._free_buffer(r)}}function ph(n,e){const t=n._get_bvh_nodes_ptr(),a=n._get_bvh_nodes_len(),r=n._get_bvh_indices_ptr(),s=n._get_bvh_indices_len(),i=n.HEAPU8.buffer.byteLength,o=t+a*Float32Array.BYTES_PER_ELEMENT,l=r+s*Int32Array.BYTES_PER_ELEMENT;if(t<0||o>i)throw new Error(`TinyBVH returned out-of-bounds node buffer (ptr=${t}, len=${a}, memory=${i})`);if(r<0||l>i)throw new Error(`TinyBVH returned out-of-bounds index buffer (ptr=${r}, len=${s}, memory=${i})`);const c=new Float32Array(a);new Uint8Array(c.buffer).set(n.HEAPU8.subarray(t,t+a*Float32Array.BYTES_PER_ELEMENT));const h=new Int32Array(s);return new Uint8Array(h.buffer).set(n.HEAPU8.subarray(r,r+s*Int32Array.BYTES_PER_ELEMENT)),{nodeData:c,triangleIndices:h,stats:{nodeCount:n._get_bvh_node_count(),triangleCount:n._get_bvh_triangle_count(),buildTimeMs:e}}}class bh{constructor(){y(this,"_data",new Float32Array(68));y(this,"_name","");y(this,"_dirty",!1);this.baseColorFactor=[1,1,1],this.metallicFactor=0,this.roughnessFactor=0,this.anisotropy=0,this.anisotropyRotation=0,this.transmissionFactor=0,this.cutoutOpacity=1,this.doubleSided=1,this.normalScale=1,this.ior=1.49,this.specularColorFactor=[1,1,1],this.specularFactor=1,this.sheenRoughnessFactor=0,this.sheenColorFactor=[0,0,0],this.clearcoatNormalTextureScale=1,this.emissiveFactor=[0,0,0],this.clearcoatFactor=0,this.clearcoatRoughnessFactor=0,this.diffuseTransmissionFactor=0,this.alphaCutoff=0,this.attenuationDistance=Number.MAX_VALUE,this.attenuationColor=[1,1,1],this.multiscatterColorFactor=[1,1,1],this.thinWalled=1,this.anisotropyDirection=[1,0,0],this.diffuseTransmissionTextureId=-1,this.iridescenceFactor=0,this.iridescenceIor=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.baseColorTextureId=-1,this.metallicRoughnessTextureId=-1,this.normalTextureId=-1,this.emissiveTextureId=-1,this.specularTextureId=-1,this.specularColorTextureId=-1,this.transmissionTextureId=-1,this.clearcoatTextureId=-1,this.clearcoatRoughnessTextureId=-1,this.clearcoatNormalTextureId=-1,this.sheenColorTextureId=-1,this.sheenRoughnessTextureId=-1,this.anisotropyTextureId=-1,this.anisotropyDirectionTextureId=-1,this.iridescenceTextureId=-1,this.iridescenceThicknessTextureId=-1,this.diffuseTransmissionColorFactor=[1,1,1],this.diffuseTransmissionColorTextureId=-1,this.dispersion=0}get data(){return this._data}get name(){return this._name}set name(e){this._name=e}get dirty(){return this._dirty}set dirty(e){this._dirty=e}set baseColorFactor(e){this._data[0]=e[0],this._data[1]=e[1],this._data[2]=e[2],this.dirty=!0}get baseColorFactor(){return[...this._data.slice(0,3)]}set metallicFactor(e){this._data[3]=e,this.dirty=!0}get metallicFactor(){return this.data[3]}set roughnessFactor(e){this._data[4]=e,this.dirty=!0}get roughnessFactor(){return this.data[4]}set anisotropy(e){this._data[5]=e,this.dirty=!0}get anisotropy(){return this.data[5]}set anisotropyRotation(e){this._data[6]=e,this.dirty=!0}get anisotropyRotation(){return this.data[6]}set transmissionFactor(e){this._data[7]=e,this.dirty=!0}get transmissionFactor(){return this.data[7]}set cutoutOpacity(e){this._data[8]=e,this.dirty=!0}get cutoutOpacity(){return this.data[8]}set doubleSided(e){this._data[9]=e,this.dirty=!0}get doubleSided(){return this.data[9]}set normalScale(e){this._data[10]=e,this.dirty=!0}get normalScale(){return this.data[10]}set ior(e){this._data[11]=e,this.dirty=!0}get ior(){return this.data[11]}set specularColorFactor(e){this._data[12]=e[0],this._data[13]=e[1],this._data[14]=e[2],this.dirty=!0}get specularColorFactor(){return[...this._data.slice(12,15)]}set specularFactor(e){this._data[15]=e,this.dirty=!0}get specularFactor(){return this.data[15]}set sheenColorFactor(e){this._data[16]=e[0],this._data[17]=e[1],this._data[18]=e[2],this.dirty=!0}get sheenColorFactor(){return[...this._data.slice(16,19)]}set sheenRoughnessFactor(e){this._data[19]=e,this.dirty=!0}get sheenRoughnessFactor(){return this.data[19]}set emissiveFactor(e){this._data[20]=e[0],this._data[21]=e[1],this._data[22]=e[2],this.dirty=!0}get emissiveFactor(){return[...this._data.slice(20,23)]}set clearcoatNormalTextureScale(e){this._data[23]=e,this.dirty=!0}get clearcoatNormalTextureScale(){return this.data[23]}set clearcoatFactor(e){this._data[24]=e,this.dirty=!0}get clearcoatFactor(){return this.data[24]}set clearcoatRoughnessFactor(e){this._data[25]=e,this.dirty=!0}get clearcoatRoughnessFactor(){return this.data[25]}set diffuseTransmissionFactor(e){this._data[26]=e,this.dirty=!0}get diffuseTransmissionFactor(){return this.data[26]}set alphaCutoff(e){this._data[27]=e}get alphaCutoff(){return this.data[27]}set attenuationColor(e){this._data[28]=e[0],this._data[29]=e[1],this._data[30]=e[2],this.dirty=!0}get attenuationColor(){return[...this._data.slice(28,31)]}set attenuationDistance(e){this._data[31]=e,this.dirty=!0}get attenuationDistance(){return this.data[31]}set multiscatterColorFactor(e){this._data[32]=e[0],this._data[33]=e[1],this._data[34]=e[2],this.dirty=!0}get multiscatterColorFactor(){return[...this._data.slice(32,35)]}set thinWalled(e){this._data[35]=e,this.dirty=!0}get thinWalled(){return this.data[35]}set anisotropyDirection(e){this._data[36]=e[0],this._data[37]=e[1],this._data[38]=e[2],this.dirty=!0}get anisotropyDirection(){return[...this._data.slice(36,39)]}set diffuseTransmissionTextureId(e){this._data[39]=e}get diffuseTransmissionTextureId(){return this._data[39]}set iridescenceFactor(e){this._data[40]=e,this.dirty=!0}get iridescenceFactor(){return this._data[40]}set iridescenceIor(e){this._data[41]=e,this.dirty=!0}get iridescenceIor(){return this._data[41]}set iridescenceThicknessMinimum(e){this._data[42]=e,this.dirty=!0}get iridescenceThicknessMinimum(){return this._data[42]}set iridescenceThicknessMaximum(e){this._data[43]=e,this.dirty=!0}get iridescenceThicknessMaximum(){return this._data[43]}set baseColorTextureId(e){this._data[44]=e}get baseColorTextureId(){return this._data[44]}set metallicRoughnessTextureId(e){this._data[45]=e}get metallicRoughnessTextureId(){return this._data[45]}set normalTextureId(e){this._data[46]=e}get normalTextureId(){return this._data[46]}set emissiveTextureId(e){this._data[47]=e}get emissiveTextureId(){return this._data[47]}set specularTextureId(e){this._data[48]=e}get specularTextureId(){return this._data[48]}set specularColorTextureId(e){this._data[49]=e}get specularColorTextureId(){return this._data[49]}set transmissionTextureId(e){this._data[50]=e}get transmissionTextureId(){return this._data[50]}set clearcoatTextureId(e){this._data[51]=e,this.dirty=!0}get clearcoatTextureId(){return this._data[51]}set clearcoatRoughnessTextureId(e){this._data[52]=e}get clearcoatRoughnessTextureId(){return this._data[52]}set clearcoatNormalTextureId(e){this._data[53]=e}get clearcoatNormalTextureId(){return this._data[53]}set sheenColorTextureId(e){this._data[54]=e}get sheenColorTextureId(){return this._data[54]}set sheenRoughnessTextureId(e){this._data[55]=e}get sheenRoughnessTextureId(){return this._data[55]}set anisotropyTextureId(e){this._data[56]=e}get anisotropyTextureId(){return this._data[56]}set anisotropyDirectionTextureId(e){this._data[57]=e}get anisotropyDirectionTextureId(){return this._data[57]}set iridescenceTextureId(e){this._data[58]=e}get iridescenceTextureId(){return this._data[58]}set iridescenceThicknessTextureId(e){this._data[59]=e}get iridescenceThicknessTextureId(){return this._data[59]}set diffuseTransmissionColorFactor(e){this._data[60]=e[0],this._data[61]=e[1],this._data[62]=e[2],this.dirty=!0}get diffuseTransmissionColorFactor(){return[...this._data.slice(60,63)]}set diffuseTransmissionColorTextureId(e){this._data[63]=e}get diffuseTransmissionColorTextureId(){return this._data[63]}set dispersion(e){this._data[64]=e,this.dirty=!0}get dispersion(){return this._data[64]}}class mh{constructor(){y(this,"_data",new Float32Array(8));this.texOffset=[0,0],this.texArrayIdx=255,this.texIdx=255,this.texScale=[1,1],this.uvSet=255}get byteLength(){return this._data.byteLength}get data(){return this._data}set texOffset(e){this._data[0]=e[0],this._data[1]=e[1]}set texArrayIdx(e){this._data[2]=e}set texIdx(e){this._data[3]=e}set texScale(e){this._data[4]=e[0],this._data[5]=e[1]}set uvSet(e){this._data[6]=e}}let gh=class{constructor(){y(this,"position",[1,1,1]);y(this,"type",0);y(this,"emission",[1,1,1]);y(this,"pad",0)}};const Oe=20;class vh{constructor(){y(this,"_lights",[]);y(this,"_materials",[]);y(this,"_texInfos",[]);y(this,"_texArrays",new Map);y(this,"_triangleBuffer");y(this,"_triangleIndexBuffer");y(this,"_bvhPositionBuffer");y(this,"_bvhIndexBuffer")}get lights(){return this._lights}get num_materials(){return this._materials.length}get materials(){return this._materials}getTexInfo(e){return this._texInfos[e]}get num_textures(){return this._texInfos.length}get texArrays(){return this._texArrays}set triangleBuffer(e){this._triangleBuffer=e}get triangleBuffer(){return this._triangleBuffer}get vertexBuffer(){return this._triangleBuffer}set triangleIndexBuffer(e){this._triangleIndexBuffer=e}get triangleIndexBuffer(){return this._triangleIndexBuffer}get num_triangles(){return this._triangleIndexBuffer?this._triangleIndexBuffer.length/3:this._triangleBuffer?this._triangleBuffer.length/(Oe*3):0}set bvhPositionBuffer(e){this._bvhPositionBuffer=e}get bvhPositionBuffer(){return this._bvhPositionBuffer}set bvhIndexBuffer(e){this._bvhIndexBuffer=e}get bvhIndexBuffer(){return this._bvhIndexBuffer}getPositionBuffer(){if(!this.triangleBuffer)return new Float32Array;const e=new Float32Array(this.triangleBuffer.length/Oe*3);for(let t=0;t<this.triangleBuffer.length/Oe;t++)e[t*3+0]=this.triangleBuffer[t*Oe+0],e[t*3+1]=this.triangleBuffer[t*Oe+1],e[t*3+2]=this.triangleBuffer[t*Oe+2];return e}addTexture(e){var i,o;const t=new mh,a=((i=e.image)==null?void 0:i.width)??0,r=((o=e.image)==null?void 0:o.height)??0,s=`${a},${r}`;if(this._texArrays.has(s)){const l=this._texArrays.get(s);let c=l.findIndex(d=>d.uuid===e.uuid);c<0&&(l.push(e),c=l.length-1);let h=0;for(const d of this._texArrays.keys()){if(d===s)break;h++}t.texArrayIdx=h,t.texIdx=c}else this._texArrays.set(s,[e]),t.texArrayIdx=this._texArrays.size-1,t.texIdx=0;return t.texOffset=[e.offset.x,e.offset.y],t.texScale=[e.repeat.x,e.repeat.y],t.uvSet=e.uvSet??0,this._texInfos.push(t),this._texInfos.length-1}addMaterial(e){return this._materials.push(e),this._materials.length-1}addLight(e){return this._lights.push(e),this._lights.length-1}getFlatMaterialBuffer(){if(this._materials.length===0)return new Float32Array(0);const e=this._materials[0].data.length,t=new Float32Array(this._materials.length*e);for(let a=0;a<this._materials.length;a++)t.set(this._materials[a].data,a*e);return t}getFlatTextureInfoBuffer(){if(this._texInfos.length===0)return new Float32Array(0);const e=this._texInfos[0].data.length,t=new Float32Array(this._texInfos.length*e);for(let a=0;a<this._texInfos.length;a++)t.set(this._texInfos[a].data,a*e);return t}}function yn(n){return n.getParameter(n.MAX_TEXTURE_SIZE)}function zn(n,e,t,a){var r=n.createTexture();return n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,n.RGBA32F,Math.floor(t),Math.floor(a),0,n.RGBA,n.FLOAT,e),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindTexture(n.TEXTURE_2D,null),r}function Ls(n,e,t){let a=n.createShader(e);if(a){if(n.shaderSource(a,t),n.compileShader(a),!n.getShaderParameter(a,n.COMPILE_STATUS)){const r=La(n,a,t);throw n.deleteShader(a),new Error(`Shader compile error:
${r}`)}return a}else throw Error("Could not create shader")}function La(n,e,t){var a=n.getShaderInfoLog(e);if(a){const r=(a==null?void 0:a.indexOf("ERROR: "))??0;let s=a==null?void 0:a.substring(r,r+20);const i=parseInt((s==null?void 0:s.match(/(:\d+)/)[0].substring(1))??"0"),o=t.split(/\r?\n/);return a+`
`+o.slice(i-5,i+5).join(`
`)}return""}const Us=new WeakMap;function xh(n){let e=Us.get(n);return e||(e=new Map,Us.set(n,e)),e}async function un(n,e,t,a,r="shader"){if(a){const c=performance.now();for(let[h,d]of a){let m=`#include <${h}>`;e=e.replace(m,d),t=t.replace(m,d)}console.debug(`Resolving shader chunks: ${r} ${(performance.now()-c).toFixed(1)}ms`)}const s=`${e}\0${t}`,i=xh(n),o=i.get(s);if(o)return console.debug(`Shader program cache hit: ${r}`),o;console.debug(`Shader program cache miss: ${r}`);const l=Sh(n,e,t,r).catch(c=>{throw i.delete(s),c});return i.set(s,l),l}async function Sh(n,e,t,a){if(n.isContextLost())throw new Error(`WebGL context lost before compiling ${a}`);var r=n.getExtension("KHR_parallel_shader_compile");const s=performance.now();let i=Ls(n,n.VERTEX_SHADER,e),o=Ls(n,n.FRAGMENT_SHADER,t);if(i&&o){let l=function(){if(n.isContextLost())throw n.deleteShader(i),n.deleteShader(o),n.deleteProgram(c),new Error(`WebGL context lost while compiling ${a}`);if(n.getProgramParameter(c,n.LINK_STATUS))return console.debug(`Shader compile/link ready: ${a} ${(performance.now()-s).toFixed(1)}ms`),!0;{const h=La(n,i,e),d=La(n,o,t),m=n.getProgramInfoLog(c)||"No program info log.";throw n.deleteShader(i),n.deleteShader(o),n.deleteProgram(c),new Error(`Program link error (${a}):
${m}
${h}
${d}`)}},c=n.createProgram();if(!c)throw Error("Could not create shader program");return n.attachShader(c,i),n.attachShader(c,o),n.linkProgram(c),console.debug(`Shader compile/link submitted: ${a} ${(performance.now()-s).toFixed(1)}ms`),r?(await new Promise(h=>{function d(){n.getProgramParameter(c,r.COMPLETION_STATUS_KHR)==!0?(l(),h()):requestAnimationFrame(d)}requestAnimationFrame(d)}),c):(l(),c)}else throw new Error("Shader compile error")}function To(n,e){if(!e)throw new Error("No data provided for data texture creation!");const t=yn(n),a=e.length/4|0,r=Math.min(a,t),s=Math.max(1,Math.ceil(a/t)),i=r*s*4,o=i>e.length?(()=>{const c=new Float32Array(i);return c.set(e),c})():e,l=n.createTexture();return n.bindTexture(n.TEXTURE_2D,l),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texImage2D(n.TEXTURE_2D,0,n.RGBA32F,r,s,0,n.RGBA,n.FLOAT,o),n.bindTexture(n.TEXTURE_2D,null),l}function _n(n,e,t,a,r,s,i,o,l,c=WebGL2RenderingContext.LINEAR,h=WebGL2RenderingContext.LINEAR,d=WebGL2RenderingContext.REPEAT,m=WebGL2RenderingContext.REPEAT){let b=n.createTexture();return n.bindTexture(e,b),n.texImage2D(e,0,t,a,r,0,s,i,o,l),n.texParameteri(e,n.TEXTURE_MIN_FILTER,c),n.texParameteri(e,n.TEXTURE_MAG_FILTER,h),n.texParameteri(e,n.TEXTURE_WRAP_S,d),n.texParameteri(e,n.TEXTURE_WRAP_T,m),n.bindTexture(e,null),b}class Th{constructor(e,t){y(this,"gl");y(this,"_sceneData");y(this,"_triangleDataTexture");y(this,"_triangleIndexTexture");y(this,"_materialDataTexture");y(this,"_materialBufferShaderChunk","");y(this,"_textureInfoDataTexture");y(this,"_texAccessorShaderChunk","");y(this,"_texArrayTextures",{});y(this,"_defaultTextureArray");y(this,"_lightShaderChunk","");y(this,"_textureDataUsage",0);y(this,"_geometryDataUsage",0);this.gl=e,this._sceneData=t}get sceneData(){return this._sceneData}get triangleDataTexture(){return this._triangleDataTexture}get triangleIndexTexture(){return this._triangleIndexTexture}get materialDataTexture(){return this._materialDataTexture}get materialBufferShaderChunk(){return this._materialBufferShaderChunk}get textureInfoDataTexture(){return this._textureInfoDataTexture}get texAccessorShaderChunk(){return this._texAccessorShaderChunk}get texArrayTextures(){return this._texArrayTextures}get lightShaderChunk(){return this._lightShaderChunk}get memoryUsage(){return{textureBytes:this._textureDataUsage,geometryBytes:this._geometryDataUsage,totalBytes:this._textureDataUsage+this._geometryDataUsage}}clear(){const e=this.gl;this._triangleDataTexture&&e.deleteTexture(this._triangleDataTexture),this._triangleIndexTexture&&e.deleteTexture(this._triangleIndexTexture),this._materialDataTexture&&e.deleteTexture(this._materialDataTexture),this._textureInfoDataTexture&&e.deleteTexture(this._textureInfoDataTexture);const t=new Set;for(let a in this._texArrayTextures){const r=this._texArrayTextures[a];r&&!t.has(r)&&(e.deleteTexture(r),t.add(r))}this._texArrayTextures={},this._materialDataTexture=void 0,this._triangleDataTexture=void 0,this._triangleIndexTexture=void 0,this._textureInfoDataTexture=void 0,this._defaultTextureArray=void 0,this._materialBufferShaderChunk="",this._texAccessorShaderChunk="",this._lightShaderChunk="",this._textureDataUsage=0,this._geometryDataUsage=0}init(){const e=performance.now(),t=this.gl;this.clear(),this._triangleDataTexture=To(t,this._sceneData.vertexBuffer),this._triangleIndexTexture=this.createIndexTexture(this._sceneData.triangleIndexBuffer),this.generateTextureArrays(),this.generateMaterialDataTexture(),this.generateLightBuffers();const a=performance.now()-e;this._geometryDataUsage=this._sceneData.vertexBuffer.byteLength+this._sceneData.triangleIndexBuffer.byteLength;const r=this._textureDataUsage/(1024*1024),s=this._geometryDataUsage/(1024*1024);console.log(`Generate gpu data buffers: ${a.toFixed(1)}ms
GPU Memory Consumption (MB):
    Texture: ${r.toFixed(2)}
    Geometry: ${s.toFixed(2)}
    Total:    ${(r+s).toFixed(2)}
    `)}createIndexTexture(e){const t=this.gl,a=yn(t),r=Math.max(1,e.length),s=Math.min(r,a),i=Math.max(1,Math.ceil(e.length/a)),o=s*i>e.length?(()=>{const c=new Int32Array(s*i);return c.set(e),c})():new Int32Array(e.buffer,e.byteOffset,e.length),l=t.createTexture();return t.bindTexture(t.TEXTURE_2D,l),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,t.R32I,s,i,0,t.RED_INTEGER,t.INT,o),t.bindTexture(t.TEXTURE_2D,null),l}updateMaterial(e){e<0||e>=this._sceneData.materials.length||this.uploadMaterialDataTexture()}uploadFloatDataTexture(e,t){const a=this.gl,r=yn(a),s=Math.max(1,t.length/4|0),i=Math.min(s,r),o=Math.max(1,Math.ceil(s/r)),l=i*o*4,c=l>t.length?(()=>{const h=new Float32Array(l);return h.set(t),h})():t;a.bindTexture(a.TEXTURE_2D,e),a.texImage2D(a.TEXTURE_2D,0,a.RGBA32F,i,o,0,a.RGBA,a.FLOAT,c),a.bindTexture(a.TEXTURE_2D,null)}uploadMaterialDataTexture(){if(!this._materialDataTexture)return;const e=this._sceneData.num_materials>0?this._sceneData.getFlatMaterialBuffer():new Float32Array(68);this.uploadFloatDataTexture(this._materialDataTexture,e)}generateMaterialDataTexture(){const e=this.gl;this._materialDataTexture=e.createTexture(),e.bindTexture(e.TEXTURE_2D,this._materialDataTexture),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null),this.uploadMaterialDataTexture(),this._materialBufferShaderChunk+=`
    uniform sampler2D u_sampler_material_data;

    vec4 fetch_material_data(uint matIdx, uint slot) {
      uint texel = matIdx * 17u + slot;
      return texelFetch(u_sampler_material_data, ivec2(int(texel % MAX_TEXTURE_SIZE), int(texel / MAX_TEXTURE_SIZE)), 0);
    }

    MaterialData get_material(uint idx) {
      MaterialData data;
      vec4 m0 = fetch_material_data(idx, 0u);
      vec4 m1 = fetch_material_data(idx, 1u);
      vec4 m2 = fetch_material_data(idx, 2u);
      vec4 m3 = fetch_material_data(idx, 3u);
      vec4 m4 = fetch_material_data(idx, 4u);
      vec4 m5 = fetch_material_data(idx, 5u);
      vec4 m6 = fetch_material_data(idx, 6u);
      vec4 m7 = fetch_material_data(idx, 7u);
      vec4 m8 = fetch_material_data(idx, 8u);
      vec4 m9 = fetch_material_data(idx, 9u);
      vec4 m10 = fetch_material_data(idx, 10u);
      vec4 m11 = fetch_material_data(idx, 11u);
      vec4 m12 = fetch_material_data(idx, 12u);
      vec4 m13 = fetch_material_data(idx, 13u);
      vec4 m14 = fetch_material_data(idx, 14u);
      vec4 m15 = fetch_material_data(idx, 15u);
      vec4 m16 = fetch_material_data(idx, 16u);

      data.baseColorFactor = m0.xyz; data.metallicFactor = m0.w;
      data.roughnessFactor = m1.x; data.anisotropy = m1.y; data.anisotropyRotation = m1.z; data.transmissionFactor = m1.w;
      data.cutoutOpacity = m2.x; data.doubleSided = m2.y > 0.5; data.normalScale = m2.z; data.ior = m2.w;
      data.specularColorFactor = m3.xyz; data.specularFactor = m3.w;
      data.sheenColorFactor = m4.xyz; data.sheenRoughnessFactor = m4.w;
      data.emissiveFactor = m5.xyz; data.clearcoatNormalTextureScale = m5.w;
      data.clearcoatFactor = m6.x; data.clearcoatRoughnessFactor = m6.y; data.diffuseTransmissionFactor = m6.z; data.alphaCutoff = m6.w;
      data.attenuationColor = m7.xyz; data.attenuationDistance = m7.w;
      data.multiscatterColorFactor = m8.xyz; data.thinWalled = m8.w > 0.5;
      data.anisotropyDirection = m9.xyz; data.diffuseTransmissionTextureId = m9.w;
      data.iridescenceFactor = m10.x; data.iridescenceIor = m10.y; data.iridescenceThicknessMinimum = m10.z; data.iridescenceThicknessMaximum = m10.w;
      data.baseColorTextureId = m11.x; data.metallicRoughnessTextureId = m11.y; data.normalTextureId = m11.z; data.emissiveTextureId = m11.w;
      data.specularTextureId = m12.x; data.specularColorTextureId = m12.y; data.transmissionTextureId = m12.z; data.clearcoatTextureId = m12.w;
      data.clearcoatRoughnessTextureId = m13.x; data.clearcoatNormalTextureId = m13.y; data.sheenColorTextureId = m13.z; data.sheenRoughnessTextureId = m13.w;
      data.anisotropyTextureId = m14.x; data.anisotropyDirectionTextureId = m14.y; data.iridescenceTextureId = m14.z; data.iridescenceThicknessTextureId = m14.w;
      data.diffuseTransmissionColorFactor = m15.xyz; data.diffuseTransmissionColorTextureId = m15.w;
      data.dispersion = m16.x;
      return data;
    }
    `}createDefaultTextureArray(){const e=this.gl,t=e.createTexture();return e.bindTexture(e.TEXTURE_2D_ARRAY,t),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_T,e.REPEAT),e.texImage3D(e.TEXTURE_2D_ARRAY,0,e.RGBA,1,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([255,255,255,255])),e.bindTexture(e.TEXTURE_2D_ARRAY,null),t}materialTextureArrayCapacity(){const e=this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);return Math.max(1,e-12)}generateTextureArrays(){const e=this.gl,t=this._sceneData.texArrays,a=o=>{const l=o.width,c=o.height,h=document.createElement("canvas");h.width=l,h.height=c;const d=h.getContext("2d");if(!d)throw new Error("Couldn't get 2D context for texture");return d.drawImage(o,0,0),d.getImageData(0,0,l,c)};this._defaultTextureArray=this.createDefaultTextureArray();const r=this.materialTextureArrayCapacity();if(t.size>r)throw new Error(`Scene uses ${t.size} material texture arrays, but this WebGL context supports ${r}`);for(let o=0;o<r;o++)this._texArrayTextures[`u_sampler2DArray_MaterialTextures_${o}`]=this._defaultTextureArray,this._texAccessorShaderChunk+=`
      uniform sampler2DArray u_sampler2DArray_MaterialTextures_${o};
      `;let s=0;for(const o of t.values()){const l=o[0].image,c=l.width,h=l.height,d=c*h*4;let m=new Uint8Array(d*o.length);this._textureDataUsage+=m.length,m.set(a(o[0].image).data);for(let _=1;_<o.length;_++)m.set(a(o[_].image).data,d*_);let b=e.createTexture();e.bindTexture(e.TEXTURE_2D_ARRAY,b),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_T,e.REPEAT),e.texImage3D(e.TEXTURE_2D_ARRAY,0,e.RGBA,c,h,o.length,0,e.RGBA,e.UNSIGNED_BYTE,m),e.bindTexture(e.TEXTURE_2D_ARRAY,null),console.log(`Create material texture array: ${c} x ${h} x ${o.length}`),this._texArrayTextures[`u_sampler2DArray_MaterialTextures_${s}`]=b,s++}this._textureInfoDataTexture=e.createTexture(),e.bindTexture(e.TEXTURE_2D,this._textureInfoDataTexture),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null);const i=this._sceneData.num_textures>0?this._sceneData.getFlatTextureInfoBuffer():new Float32Array([0,0,255,255,1,1,255,0]);this.uploadFloatDataTexture(this._textureInfoDataTexture,i),this._texAccessorShaderChunk+=`
    uniform sampler2D u_sampler_texture_info;

    TexInfo get_texture_info(int idx) {
      int texel = idx * 2;
      vec4 t0 = texelFetch(u_sampler_texture_info, ivec2(texel % int(MAX_TEXTURE_SIZE), texel / int(MAX_TEXTURE_SIZE)), 0);
      vec4 t1 = texelFetch(u_sampler_texture_info, ivec2((texel + 1) % int(MAX_TEXTURE_SIZE), (texel + 1) / int(MAX_TEXTURE_SIZE)), 0);
      TexInfo info;
      info.offset = t0.xy;
      info.tex_array_idx = t0.z;
      info.tex_idx = t0.w;
      info.scale = t1.xy;
      info.uv_set = t1.z;
      info.pad = t1.w;
      return info;
    }
    `,this._texAccessorShaderChunk+=`
    vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) {
    `;for(let o=0;o<r;o++)this._texAccessorShaderChunk+=`
      if(int(texInfo.tex_array_idx) == ${o}) {
        vec2 tuv = texCoord * texInfo.scale + texInfo.offset;
        return texture(u_sampler2DArray_MaterialTextures_${o}, vec3(tuv, texInfo.tex_idx));
      }`;this._texAccessorShaderChunk+=`
      return vec4(1.0);
    }`,this._texAccessorShaderChunk+=`
    vec4 get_texture_value(float tex_info_id, vec2 uv) {
      return tex_info_id < 0.0 ? vec4(1,1,1,1) : evaluateMaterialTextureValue(get_texture_info(int(tex_info_id)), uv);
    }

    vec4 get_texture_value(float tex_info_id, vec2 uv0, vec2 uv1) {
      if (tex_info_id < 0.0) return vec4(1,1,1,1);
      TexInfo info = get_texture_info(int(tex_info_id));
      vec2 uv = info.uv_set > 0.5 ? uv1 : uv0;
      return evaluateMaterialTextureValue(info, uv);
    }
    `}generateLightBuffers(){this._sceneData.lights,this._lightShaderChunk=""}}const wh=`const float PI =               3.14159265358979323;
const float TWO_PI =           6.28318530717958648;
const float FOUR_PI =          12.5663706143591729;
const float ONE_OVER_PI =      0.31830988618379067;
const float ONE_OVER_TWO_PI =  0.15915494309;
const float ONE_OVER_FOUR_PI = 0.07957747154594767;
const float PI_OVER_TWO =      1.57079632679489662;
const float ONE_OVER_THREE =   0.33333333333333333;
const float E =                2.71828182845904524;
const float INFINITY =         1000000.0;

const float EPS  = 1e-8;
const float EPS_COS = 0.001;
const float EPS_PDF = 0.001;

const float MINIMUM_ROUGHNESS = 0.0001;
const float TFAR_MAX = 100000.0;
const float BVH_FAR  = 1e30;

const int RR_START_DEPTH = 2;
const float RR_TERMINATION_PROB = 0.1;

const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 BLACK = vec4(0.0, 0.0, 0.0, 1.0);
`,yh=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D tex;
in vec2 v_uv;
out vec4 out_FragColor;

void main()
{
  vec2 uv = (v_uv + vec2(1.0)) * 0.5;
  out_FragColor = texture(tex, uv);
}`,Eh=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D tex;

in vec2 v_uv;
out vec4 out_color;

void main() {
  vec2 uv = (v_uv + vec2(1.0)) * 0.5;
  out_color = texture(tex, uv);
}`,Ch=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D tex;
uniform float exposure;
uniform bool gamma;
uniform int tonemappingMode;
const vec3 whitePoint = vec3(1.0);

in vec2 v_uv;
out vec4 out_FragColor;

#ifndef saturate
#define saturate(a) clamp(a, 0.0, 1.0)
#endif

// exposure only
vec3 LinearToneMapping(vec3 color) {
  return exposure * color;
}

vec3 ReinhardToneMapping(vec3 color) {
  color *= exposure;
  return saturate(color / (vec3(1.0) + color));
}

#define Uncharted2Helper(x)                                                                                            \\
  max(((x * (0.15 * x + 0.10 * 0.50) + 0.20 * 0.02) / (x * (0.15 * x + 0.50) + 0.20 * 0.30)) - 0.02 / 0.30, vec3(0.0))

vec3 Uncharted2ToneMapping(vec3 color) {
  // John Hable's filmic operator from Uncharted 2 video game
  color *= exposure;
  return saturate(Uncharted2Helper(color) / Uncharted2Helper(vec3(whitePoint)));
}

vec3 OptimizedCineonToneMapping(vec3 color) {
  // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
  color *= exposure;
  color = max(vec3(0.0), color - 0.004);
  return pow((color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06), vec3(2.2));
}

vec3 RRTAndODTFit(vec3 v) {

  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}

vec3 ACESFilmicToneMapping(vec3 color) {

  // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
  const mat3 ACESInputMat = mat3(vec3(0.59719, 0.07600, 0.02840), // transposed from source
                                 vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));

  // ODT_SAT => XYZ => D60_2_D65 => sRGB
  const mat3 ACESOutputMat = mat3(vec3(1.60475, -0.10208, -0.00327), // transposed from source
                                  vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));

  color = ACESInputMat * color;
  // Apply RRT and ODT
  color = RRTAndODTFit(color);
  color = ACESOutputMat * color;
  // Clamp to [0, 1]
  return saturate(color);
}

void main() {
  vec2 uv = (v_uv + vec2(1.0)) * 0.5;

  vec4 pixel_value = texture(tex, uv);
  vec3 color = pixel_value.xyz;
  float alpha = pixel_value.w;

  if (tonemappingMode == 0)
    color = LinearToneMapping(color);
  if (tonemappingMode == 1)
    color = ReinhardToneMapping(color);
  if (tonemappingMode == 2)
    color = OptimizedCineonToneMapping(color);
  if (tonemappingMode == 3) {
    color *= exposure / 0.6; // pre-exposed, outside of the tone mapping function
    color = ACESFilmicToneMapping(color);
  }
  if (tonemappingMode == 4)
    color = Uncharted2ToneMapping(color);

  if (gamma)
    color = pow(color, vec3(1.0 / 2.2));

  out_FragColor = vec4(color, alpha);
}`,Ih=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D tex;
uniform vec2 u_inv_res;

out vec4 out_color;

#ifndef FXAA_REDUCE_MIN
#define FXAA_REDUCE_MIN (1.0 / 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
#define FXAA_REDUCE_MUL (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
#define FXAA_SPAN_MAX 8.0
#endif

// https://github.com/mattdesl/glsl-fxaa
vec4 fxaa(sampler2D tex, vec2 fragCoord) {
  vec4 color;
  vec3 rgbNW = texture(tex, (fragCoord + vec2(-1.0, -1.0)) * u_inv_res).xyz;
  vec3 rgbNE = texture(tex, (fragCoord + vec2(1.0, -1.0)) * u_inv_res).xyz;
  vec3 rgbSW = texture(tex, (fragCoord + vec2(-1.0, 1.0)) * u_inv_res).xyz;
  vec3 rgbSE = texture(tex, (fragCoord + vec2(1.0, 1.0)) * u_inv_res).xyz;
  vec4 texColor = texture(tex, vec2(fragCoord * u_inv_res));

  vec3 rgbM = texColor.xyz;
  vec3 luma = vec3(0.299, 0.587, 0.114);
  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM = dot(rgbM, luma);
  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

  mediump vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));

  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * u_inv_res;

  vec3 rgbA = 0.5 * (texture(tex, fragCoord * u_inv_res + dir * (1.0 / 3.0 - 0.5)).xyz +
                     texture(tex, fragCoord * u_inv_res + dir * (2.0 / 3.0 - 0.5)).xyz);
  vec3 rgbB = rgbA * 0.5 + 0.25 * (texture(tex, fragCoord * u_inv_res + dir * -0.5).xyz +
                                   texture(tex, fragCoord * u_inv_res + dir * 0.5).xyz);

  float lumaB = dot(rgbB, luma);
  if ((lumaB < lumaMin) || (lumaB > lumaMax))
    color = vec4(rgbA, texColor.a);
  else
    color = vec4(rgbB, texColor.a);
  return color;
}


void main() {
  out_color = fxaa(tex, gl_FragCoord.xy);
}`,Rh=`

struct MaterialData {
  vec3 baseColorFactor; // 0
  float metallicFactor; // 3

  float roughnessFactor; //4
  float anisotropy;
  float anisotropyRotation;
  float transmissionFactor;

  float cutoutOpacity; // 8
  bool doubleSided;
  float normalScale;
  float ior;

  vec3 specularColorFactor; // 12
  float specularFactor; // 15

  vec3 sheenColorFactor; // 16
  float sheenRoughnessFactor; // 19

  vec3 emissiveFactor; // 20
  float clearcoatNormalTextureScale; // 23

  float clearcoatFactor; // 24
  float clearcoatRoughnessFactor;
  float diffuseTransmissionFactor;
  float alphaCutoff;

  vec3 attenuationColor; // 28
  float attenuationDistance; // 31

  vec3 multiscatterColorFactor; // 32
  bool thinWalled; // 35

  vec3 anisotropyDirection; // 36
  float diffuseTransmissionTextureId; // 39

  // 11
  float iridescenceFactor; // 40
  float iridescenceIor;
  float iridescenceThicknessMinimum;
  float iridescenceThicknessMaximum;

  float baseColorTextureId; //44
  float metallicRoughnessTextureId;
  float normalTextureId;
  float emissiveTextureId;

  float specularTextureId; //48
  float specularColorTextureId;
  float transmissionTextureId;
  float clearcoatTextureId;

  float clearcoatRoughnessTextureId; //52
  float clearcoatNormalTextureId;
  float sheenColorTextureId;
  float sheenRoughnessTextureId;

  float anisotropyTextureId; // 56
  float anisotropyDirectionTextureId;
  float iridescenceTextureId;
  float iridescenceThicknessTextureId;

  vec3 diffuseTransmissionColorFactor; // 60
  float diffuseTransmissionColorTextureId;

  float dispersion; // 64
};

struct TexInfo {
  vec2 offset;
  float tex_array_idx;
  float tex_idx;
  vec2 scale;
  float uv_set;
  float pad;
};


struct MaterialClosure {
  PbrGltfMaterial material;
  float cutout_opacity;
  bool thin_walled;
  bool double_sided;
  bool backside;
  vec3 n;
  vec3 ng;
  vec4 t;
  int event_type;
  vec3 anisotropyTangent;
};

struct RenderState {
  vec3 hitPos;
  vec3 n;
  vec3 ng;
  vec4 tangent;
  vec3 wo;
  vec3 wi;
  vec2 uv0;
  vec2 uv1;
  MaterialClosure closure;
};


// struct Light {
//     vec3 position;
//     float type;
//     vec3 emission;
//     float pad;
// };
// void unpackLightData(uint lightIdx, out Light light) {
//     vec4 val;
//     val = texelFetch(u_sampler2D_LightData, getStructParameterTexCoord(lightIdx, 0u, LIGHT_SIZE),
//     0); light.position = val.xyz; light.type = val.w; val = texelFetch(u_sampler2D_LightData,
//     getStructParameterTexCoord(lightIdx, 1u, LIGHT_SIZE), 0); light.emission = val.xyz;
// }
`,Ah=`precision highp float;

uvec2 rng_state;

uint george_marsaglia_rng() {
    rng_state.x = 36969u * (rng_state.x & 65535u) + (rng_state.x >> 16u);
    rng_state.y = 18000u * (rng_state.y & 65535u) + (rng_state.y >> 16u);
    return (rng_state.x << 16u) + rng_state.y;
}

void rng_set_state(uvec2 state) {
  rng_state = state;
}

uvec2 rng_get_state() {
  return rng_state;
}

float rng_float() {
    return float(george_marsaglia_rng()) / float(0xFFFFFFFFu);
}

void rng_init(int seed) {
    vec2 offset = vec2(seed*17,0.0);

    //Initialize RNG
    rng_state = uvec2(397.6432*(gl_FragCoord.xy+offset));
    rng_state ^= uvec2(32.9875*(gl_FragCoord.yx+offset));
}
///////////////////////////////////////////////////////////////////////////////
`,Dh=`struct Geometry {
  vec3 n, t, b;
};

float saturate(float val) {
  return clamp(val, 0.0, 1.0);
}

float saturate_cos(float val) {
  return clamp(val, EPS_COS, 1.0);
}

vec3 saturate(vec3 v) {
  return vec3(saturate(v.x), saturate(v.y), saturate(v.z));
}

float sqr(float x) {
  return x * x;
}

float sum(vec3 v) {
  return dot(vec3(1.0), v);
}

vec3 flip(vec3 v, vec3 n) {
  return normalize(v - 2.0 * n * abs(dot(v, n)));
}

float luminance(vec3 rgb) {
  return 0.2126 * rgb.x + 0.7152 * rgb.y + 0.0722 * rgb.z;
}

bool isNan(float val) {
  return (val <= 0.0 || 0.0 <= val) ? false : true;
}

vec3 to_local(vec3 v, Geometry g) {
  return vec3(dot(v, g.t), dot(v, g.b), dot(v, g.n));
}

vec3 to_world(vec3 v, Geometry g) {
  return g.t * v.x + g.b * v.y + g.n * v.z;
}

bool has_flag(int flags, int mask) {
  return (flags & mask) > 0;
}
// wi points towards surface
vec3 refractIt(vec3 wi, vec3 n, float inv_eta, out bool tir) {
  tir = false;
  float cosi = dot(-wi, n);
  float cost2 = 1.0 - inv_eta * inv_eta * (1.0 - cosi * cosi);
  vec3 wo = inv_eta * wi + ((inv_eta * cosi - sqrt(abs(cost2))) * n);
  if (cost2 <= 0.0) {
    tir = true;
    wo = reflect(wi, n);
  }
  return wo;
}

// Bends shading normal n into the direction of the geometry normal ng
// such that incident direction wi reflected at n does not change
// hemisphere
vec3 clamp_normal(vec3 n, vec3 ng, vec3 wi) {
  vec3 ns_new = n;
  vec3 r = reflect(-wi, n);
  float v_dot_ng = dot(wi, ng);
  float r_dot_ng = dot(r, ng);

  // if wi and r are in different hemisphere in respect of geometry normal
  if (v_dot_ng * r_dot_ng < 0.0) {
    float ns_dot_ng = abs(dot(n, ng));
    vec3 offset_vec = n * (-r_dot_ng / ns_dot_ng);
    vec3 r_corrected = normalize(r + offset_vec); // move r on horizon
    r_corrected =
        normalize(r_corrected + (ng * EPS_COS) * ((v_dot_ng > 0.0) ? 1.0 : -1.0)); // to avoid precision problems
    ns_new = normalize(wi + r_corrected);
    ns_new *= (dot(ns_new, n) < 0.0) ? -1.0 : 1.0;
  }
  return ns_new;
}

// Flips normal n and geometry normal ng such that they point into
// the direction of the given incident direction wi.
// This function should be called in each sample/eval function to prepare
// the tangent space in a way that the BSDF looks the same from top and
// bottom (two-sided materials).
bool fix_normals(inout vec3 n, inout vec3 ng, in vec3 wi) {
  bool backside = false;
  if (dot(wi, ng) < 0.0) {
    ng = -ng;
    backside = true;
  }
  if (dot(ng, n) < 0.0) {
    n = -n;
  }
  return backside;
}

vec3 fix_normal(in vec3 n, in vec3 wi) {
  return dot(n, wi) < 0.0 ? -n : n;
}

mat3 get_onb(vec3 n) {
  // from Spencer, Jones "Into the Blue", eq(3)
  vec3 tangent = normalize(cross(n, vec3(-n.z, n.x, -n.y)));
  vec3 bitangent = cross(n, tangent);
  return mat3(tangent, bitangent, n);
}

mat3 get_onb(vec3 n, vec3 t) {
  vec3 b = normalize(cross(n, t));
  vec3 tt = cross(b, n);
  return mat3(tt, b, n);
}

Geometry calculateBasis(vec3 n, vec4 t) {
  Geometry g;
  g.n = n;
  g.t = t.xyz;
  g.b = cross(n, t.xyz) * t.w;
  return g;
}

float computeTheta(vec3 dir) {
  return acos(max(-1.0, min(1.0, dir.y)));
}

float computePhi(vec3 dir) {
  float temp = atan(dir.z, dir.x);
  if (temp < 0.0)
    return TWO_PI + temp;
  else
    return temp;
}

vec3 fromThetaPhi(float theta, float phi) {
  return vec3(sin(theta) * cos(phi), cos(theta), sin(theta) * sin(phi));
}

vec2 dir_to_uv(vec3 dir, out float pdf) {
  float theta = computeTheta(dir);
  float u = computePhi(dir) / TWO_PI;
  float v = theta / PI;
  pdf = 1.0 / (2.0 * PI * PI * max(EPS_COS, sin(theta)));
  return vec2(u, v);
}

vec3 uv_to_dir(vec2 uv, out float pdf) {
  float theta = uv.y * PI;
  float phi = uv.x * TWO_PI;
  pdf = 1.0 / (2.0 * PI * PI * max(EPS_COS, sin(theta)));
  return fromThetaPhi(theta, phi);
}

vec3 sampleHemisphereCosine(vec2 uv, out float pdf) {
  float phi = uv.y * TWO_PI;
  float cosTheta = sqrt(1.0 - uv.x);
  float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
  pdf = cosTheta * ONE_OVER_PI;
  return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);
}

vec3 sampleHemisphereUniform(vec2 uv, out float pdf) {
  float phi = uv.y * TWO_PI;
  float cosTheta = 1.0 - uv.x;
  float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
  pdf = ONE_OVER_TWO_PI;
  return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);
  }

vec3 compute_triangle_normal(in vec3 p0, in vec3 p1, in vec3 p2) {
  vec3 e0 = p2 - p0;
  vec3 e1 = p1 - p0;
  return normalize(cross(e1, e0));
}

float max_(vec3 v) {
  return max(v.x, max(v.y, v.z));
}


vec4 rotation_to_tangent(float angle, vec3 normal, vec4 tangent) {
  if (angle > 0.0) {
    Geometry g = calculateBasis(normal, tangent);
    return vec4(g.t * cos(angle) + g.b * sin(angle), tangent.w);
  } else {
    return tangent;
  }
}

vec3 to_linear_rgb(vec3 srgb) {
  return pow(srgb, vec3(2.2));
}

int lower_bound(sampler2D data, int row, int size, float value)
{
  int idx;
  int step;
  int count = size;
  int first = 0;
  while (count > 0)
  {
    idx = first;
    step = count / 2;
    idx += step;
    float v = texelFetch(data, ivec2(idx, row), 0).x;
    if (v < value)
    {
      first = ++idx;
      count -= step + 1;
    }
    else
      count = step;
  }
  return first;
}


float mis_balance_heuristic(float a, float b) {
	return a / (a + b);
}
`,Mh=`const int E_DELTA = 0x00002;
const int E_REFLECTION = 0x00004;
const int E_TRANSMISSION = 0x00008;

void configure_gltf_material(const in uint matIdx, in RenderState rs, out MaterialClosure c, vec4 vertexColor) {
  MaterialData matData = get_material(matIdx);
  PbrGltfMaterial material;

  vec4 baseColorFactor = get_texture_value(matData.baseColorTextureId, rs.uv0, rs.uv1);
  material.baseColorFactor = vec4(matData.baseColorFactor * to_linear_rgb(baseColorFactor.xyz), baseColorFactor.w);
  float opacity = baseColorFactor.w;

  if (length(vertexColor) > 0.0) {
    material.baseColorFactor.rgb *= vertexColor.xyz;
    opacity *= vertexColor.w;
  }
  material.baseColorFactor.a = opacity;

  c.cutout_opacity = matData.cutoutOpacity * opacity;
  if (matData.alphaCutoff > 0.0) { // MASK
    c.cutout_opacity = step(matData.alphaCutoff, c.cutout_opacity);
  }
  if (matData.alphaCutoff == 1.0) { // OPAQUE
    c.cutout_opacity = 1.0;
  }

  material.transmissionFactor = matData.transmissionFactor * get_texture_value(matData.transmissionTextureId, rs.uv0, rs.uv1).x;

  material.diffuseTransmissionFactor = matData.diffuseTransmissionFactor * get_texture_value(matData.diffuseTransmissionTextureId, rs.uv0, rs.uv1).x;
  material.diffuseTransmissionColorFactor = matData.diffuseTransmissionColorFactor * to_linear_rgb(get_texture_value(matData.diffuseTransmissionColorTextureId, rs.uv0, rs.uv1).xyz);

  c.thin_walled = matData.thinWalled;
  material.ior = matData.ior;

  c.double_sided = matData.doubleSided;

  vec4 occlusionRoughnessMetallic = get_texture_value(matData.metallicRoughnessTextureId, rs.uv0, rs.uv1);
  material.metallicFactor = matData.metallicFactor * occlusionRoughnessMetallic.z;
  material.roughnessFactor = matData.roughnessFactor * occlusionRoughnessMetallic.y;

  vec4 anisotropy = get_texture_value(matData.anisotropyTextureId, rs.uv0, rs.uv1);
  material.anisotropyStrength = matData.anisotropy * anisotropy.b;

  vec4 specularColor = get_texture_value(matData.specularColorTextureId, rs.uv0, rs.uv1);
  material.specularColorFactor = matData.specularColorFactor * pow(specularColor.rgb, vec3(2.2));
  vec4 specularFactor = get_texture_value(matData.specularTextureId, rs.uv0, rs.uv1);
  material.specularFactor = matData.specularFactor * specularFactor.a;

  vec4 sheenColorFactor = get_texture_value(matData.sheenColorTextureId, rs.uv0, rs.uv1);
  vec4 sheenRoughnessFactor = get_texture_value(matData.sheenRoughnessTextureId, rs.uv0, rs.uv1);
  material.sheenRoughnessFactor = matData.sheenRoughnessFactor * sheenRoughnessFactor.x;
  material.sheenColorFactor = matData.sheenColorFactor * to_linear_rgb(sheenColorFactor.xyz);

  c.n = rs.n;
  c.ng = rs.ng;
  c.t = vec4(rs.tangent.xyz, rs.tangent.w);

  if (matData.normalTextureId >= 0.0) {
    mat3 to_world = get_onb(c.n, c.t.xyz);
    vec3 n = normalize(get_texture_value(matData.normalTextureId, rs.uv0, rs.uv1).xyz * 2.0 - vec3(1.0));
    n = normalize(n * vec3(matData.normalScale, matData.normalScale, 1.0));
    c.n = to_world * n;

    // ensure orthonormal tangent after changing normal
    vec3 b = normalize(cross(c.n, c.t.xyz)) * c.t.w;
    c.t.xyz = cross(b, c.n);
  }

  // ensure n and ng point into the same hemisphere as wi
  // remember whether we hit from backside
  vec3 wi = rs.wi;
  c.backside = fix_normals(c.n, c.ng, wi);

  vec3 anisotropyDirection = matData.anisotropyDirection;
  if (matData.anisotropyDirectionTextureId >= 0.0)
    anisotropyDirection = get_texture_value(matData.anisotropyDirectionTextureId, rs.uv0, rs.uv1).xyz * 2.0 - vec3(1);
  else if (matData.anisotropyTextureId >= 0.0)
    anisotropyDirection = vec3(anisotropy.rg * 2.0 - vec2(1.0), 0.0);
  anisotropyDirection.z = 0.0;

  material.anisotropyRotation = atan(anisotropyDirection.y, anisotropyDirection.x);
  c.t = rotation_to_tangent(material.anisotropyRotation + PI, c.n, c.t);
  c.anisotropyTangent = c.t.xyz;

  vec3 emissiveFactor = get_texture_value(matData.emissiveTextureId, rs.uv0, rs.uv1).xyz;
  material.emissiveFactor = matData.emissiveFactor.xyz * to_linear_rgb(emissiveFactor);
  material.emissiveStrength = 1.0;

  vec4 clearcoatFactor = get_texture_value(matData.clearcoatTextureId, rs.uv0, rs.uv1);
  material.clearcoatFactor = matData.clearcoatFactor * clearcoatFactor.x;
  vec4 clearcoatRoughnessFactor = get_texture_value(matData.clearcoatRoughnessTextureId, rs.uv0, rs.uv1);
  material.clearcoatRoughnessFactor = matData.clearcoatRoughnessFactor * clearcoatRoughnessFactor.x;
  material.clearcoatNormalTextureScale = matData.clearcoatNormalTextureScale;

  material.attenuationColor = matData.attenuationColor;
  material.attenuationDistance = matData.attenuationDistance;
  material.thicknessFactor = c.thin_walled ? 0.0 : 1.0;
  material.multiscatterColorFactor = vec3(0.0);
  material.scatterAnisotropy = 0.0;

  material.iridescenceFactor = matData.iridescenceFactor * get_texture_value(matData.iridescenceTextureId, rs.uv0, rs.uv1).x;
  material.iridescenceIor = matData.iridescenceIor;
  material.iridescenceThickness = mix(matData.iridescenceThicknessMinimum, matData.iridescenceThicknessMaximum,
                                      get_texture_value(matData.iridescenceThicknessTextureId, rs.uv0, rs.uv1).y);
  material.dispersion = matData.dispersion;
  material.normalTextureScale = matData.normalScale;
  material.featureMask = 0U;

  c.material = material;
}
`,Ph=`// AUTO-GENERATED by tools/generate_slang_materials.mjs
// Include-safe GLSL library emitted by slang-pbr for webgl-lean.
// Do not edit by hand.

float enterpriseApproxAverageAlbedoGGX_0(float alpha_0)
{

    float roughness_0 = sqrt(max(alpha_0, 0.0));
    return clamp(1.0 - 0.57999998331069946 * roughness_0 + 0.07999999821186066 * roughness_0 * roughness_0, 0.0, 1.0);
}


float enterpriseApproxAverageAlbedoGGXMs_0(float alpha_1, float e0_0)
{
    return clamp(clamp(e0_0 + (1.0 - e0_0) * 0.0476190485060215, 0.0, 1.0) * enterpriseApproxAverageAlbedoGGX_0(alpha_1), 0.0, 1.0);
}


float EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGXMs_0(float alpha_2, float e0_1)
{

    return enterpriseApproxAverageAlbedoGGXMs_0(alpha_2, e0_1);
}


float averageAlbedoGGXMsGeneric_0(float alpha_3, float e0_2)
{

    return EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGXMs_0(alpha_3, e0_2);
}


float enterpriseApproxDirectionalAlbedoGGX_0(float alpha_4, float cosTheta_0)
{



    return clamp(1.0 - sqrt(max(alpha_4, 0.0)) * (0.5 + 0.5 * pow(1.0 - clamp(cosTheta_0, 0.0, 1.0), 5.0)), 0.0, 1.0);
}


float enterpriseApproxDirectionalAlbedoGGXMs_0(float theta_0, float alpha_5, float e0_3)
{

    float noV_0 = clamp(theta_0, 0.0, 1.0);


    return clamp(clamp(e0_3 + (1.0 - e0_3) * pow(1.0 - noV_0, 5.0), 0.0, 1.0) * mix(1.0, enterpriseApproxDirectionalAlbedoGGX_0(alpha_5, noV_0), 0.64999997615814209), 0.0, 1.0);
}


float EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGXMs_0(float theta_1, float alpha_6, float e0_4)
{

    return enterpriseApproxDirectionalAlbedoGGXMs_0(theta_1, alpha_6, e0_4);
}


float directionalAlbedoGGXMsGeneric_0(float theta_2, float alpha_7, float e0_5)
{

    return EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGXMs_0(theta_2, alpha_7, e0_5);
}


float EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGX_0(float alpha_8)
{

    return enterpriseApproxAverageAlbedoGGX_0(alpha_8);
}


float averageAlbedoGGXGeneric_0(float alpha_9)
{

    return EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGX_0(alpha_9);
}


float EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGX_0(float alpha_10, float cosTheta_1)
{

    return enterpriseApproxDirectionalAlbedoGGX_0(alpha_10, cosTheta_1);
}


float directionalAlbedoGGXGeneric_0(float alpha_11, float cosTheta_2)
{

    return EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGX_0(alpha_11, cosTheta_2);
}


struct GltfPbrMaterial_0
{
    vec4 baseColorFactor_0;
    float metallicFactor_0;
    float roughnessFactor_0;
    vec3 emissiveFactor_0;
    float emissiveStrength_0;
    float specularFactor_0;
    vec3 specularColorFactor_0;
    float transmissionFactor_0;
    float diffuseTransmissionFactor_0;
    vec3 diffuseTransmissionColorFactor_0;
    float ior_0;
    vec3 attenuationColor_0;
    float attenuationDistance_0;
    float thicknessFactor_0;
    vec3 multiscatterColorFactor_0;
    float scatterAnisotropy_0;
    float clearcoatFactor_0;
    float clearcoatRoughnessFactor_0;
    float clearcoatNormalTextureScale_0;
    vec3 sheenColorFactor_0;
    float sheenRoughnessFactor_0;
    float anisotropyStrength_0;
    float anisotropyRotation_0;
    float iridescenceFactor_0;
    float iridescenceIor_0;
    float iridescenceThickness_0;
    float dispersion_0;
    float normalTextureScale_0;
    uint featureMask_0;
};


GltfPbrMaterial_0 defaultGltfPbrMaterial_0()
{

    GltfPbrMaterial_0 material_0;
    material_0.baseColorFactor_0 = vec4(1.0);
    material_0.metallicFactor_0 = 1.0;
    material_0.roughnessFactor_0 = 1.0;
    const vec3 _S1 = vec3(0.0);

    material_0.emissiveFactor_0 = _S1;
    material_0.emissiveStrength_0 = 1.0;

    material_0.specularFactor_0 = 1.0;
    const vec3 _S2 = vec3(1.0);

    material_0.specularColorFactor_0 = _S2;

    material_0.transmissionFactor_0 = 0.0;
    material_0.diffuseTransmissionFactor_0 = 0.0;
    material_0.diffuseTransmissionColorFactor_0 = _S2;
    material_0.ior_0 = 1.5;
    material_0.attenuationColor_0 = _S2;
    material_0.attenuationDistance_0 = 1.00000002004087734e+20;
    material_0.thicknessFactor_0 = 0.0;
    material_0.multiscatterColorFactor_0 = _S1;
    material_0.scatterAnisotropy_0 = 0.0;

    material_0.clearcoatFactor_0 = 0.0;
    material_0.clearcoatRoughnessFactor_0 = 0.0;
    material_0.clearcoatNormalTextureScale_0 = 1.0;

    material_0.sheenColorFactor_0 = _S1;
    material_0.sheenRoughnessFactor_0 = 0.0;

    material_0.anisotropyStrength_0 = 0.0;
    material_0.anisotropyRotation_0 = 0.0;

    material_0.iridescenceFactor_0 = 0.0;
    material_0.iridescenceIor_0 = 1.29999995231628418;
    material_0.iridescenceThickness_0 = 400.0;

    material_0.dispersion_0 = 0.0;

    material_0.normalTextureScale_0 = 1.0;

    material_0.featureMask_0 = 0U;
    return material_0;
}
struct SurfaceMaterial_0
{
    vec3 albedo_0;
    float metallic_0;
    float roughness_1;
    float anisotropy_0;
    vec3 anisotropyDirection_0;
    float transparency_0;
    float ior_1;
    vec3 specularColor_0;
    float specular_0;
    vec3 emission_0;
    float normalScale_0;
    vec3 attenuationColor_1;
    float attenuationDistance_1;
    vec3 multiscatterColor_0;
    float scatterAnisotropy_1;
    float thinWalled_0;
    float translucency_0;
    vec3 translucencyColor_0;
    float iridescence_0;
    float iridescenceIor_1;
    float iridescenceThickness_1;
    float dispersion_1;
    float clearcoat_0;
    float clearcoatRoughness_0;
    vec3 sheenColor_0;
    float sheenRoughness_0;
    float clearcoatNormalScale_0;
    float frontFaceEmissionOnly_0;
};


SurfaceMaterial_0 buildEnterpriseSurfaceFromGltf_0(GltfPbrMaterial_0 material_2)
{

    SurfaceMaterial_0 surface_0;
    const vec3 _S4 = vec3(0.0);

    const vec3 _S5 = vec3(1.0);

    surface_0.albedo_0 = clamp(material_2.baseColorFactor_0.xyz, _S4, _S5);
    surface_0.metallic_0 = clamp(material_2.metallicFactor_0, 0.0, 1.0);
    surface_0.roughness_1 = clamp(material_2.roughnessFactor_0, 0.0, 1.0);
    surface_0.anisotropy_0 = clamp(material_2.anisotropyStrength_0, 0.0, 1.0);
    surface_0.anisotropyDirection_0 = vec3(cos(material_2.anisotropyRotation_0), sin(material_2.anisotropyRotation_0), 0.0);
    surface_0.transparency_0 = clamp(material_2.transmissionFactor_0, 0.0, 1.0);
    surface_0.ior_1 = max(material_2.ior_0, 1.0);
    surface_0.specularColor_0 = clamp(material_2.specularColorFactor_0, _S4, _S5);
    surface_0.specular_0 = clamp(material_2.specularFactor_0, 0.0, 1.0);
    surface_0.emission_0 = max(material_2.emissiveFactor_0 * material_2.emissiveStrength_0, _S4);
    surface_0.normalScale_0 = material_2.normalTextureScale_0;
    surface_0.attenuationColor_1 = max(material_2.attenuationColor_0, vec3(0.00009999999747379));
    surface_0.attenuationDistance_1 = max(material_2.attenuationDistance_0, 0.00009999999747379);
    surface_0.multiscatterColor_0 = clamp(material_2.multiscatterColorFactor_0, _S4, _S5);
    surface_0.scatterAnisotropy_1 = clamp(material_2.scatterAnisotropy_0, -0.99900001287460327, 1.0);

    float _S6;
    if((material_2.thicknessFactor_0) > 0.0)
    {

        _S6 = 0.0;

    }
    else
    {

        _S6 = 1.0;

    }

    surface_0.thinWalled_0 = _S6;
    surface_0.translucency_0 = clamp(material_2.diffuseTransmissionFactor_0, 0.0, 1.0);
    surface_0.translucencyColor_0 = clamp(material_2.diffuseTransmissionColorFactor_0, _S4, _S5);
    surface_0.iridescence_0 = clamp(material_2.iridescenceFactor_0, 0.0, 1.0);
    surface_0.iridescenceIor_1 = clamp(material_2.iridescenceIor_0, 1.0, 2.5);
    surface_0.iridescenceThickness_1 = max(material_2.iridescenceThickness_0, 0.0);
    surface_0.dispersion_1 = max(material_2.dispersion_0, 0.0);
    surface_0.clearcoat_0 = clamp(material_2.clearcoatFactor_0, 0.0, 1.0);
    surface_0.clearcoatRoughness_0 = clamp(material_2.clearcoatRoughnessFactor_0, 0.0, 1.0);
    surface_0.sheenColor_0 = clamp(material_2.sheenColorFactor_0, _S4, _S5);
    surface_0.sheenRoughness_0 = clamp(material_2.sheenRoughnessFactor_0, 0.0, 1.0);
    surface_0.clearcoatNormalScale_0 = material_2.clearcoatNormalTextureScale_0;
    surface_0.frontFaceEmissionOnly_0 = 0.0;
    return surface_0;
}


SurfaceMaterial_0 buildPbrSurfaceFromGltf_0(GltfPbrMaterial_0 material_3)
{
    return buildEnterpriseSurfaceFromGltf_0(material_3);
}


struct SurfaceLayerNormals_0
{
    vec3 rawGeometry_0;
    vec3 geometry_0;
    vec3 shadingGeometry_0;
    vec3 interfaceBase_0;
    vec3 base_0;
    vec3 clearcoat_1;
    vec3 anisotropyTangent_0;
};
vec3 clamp01_0(vec3 v_0)
{

    return clamp(v_0, vec3(0.0), vec3(1.0));
}


vec3 schlickAverageWeight_0(vec3 f0_0, vec3 f90_0)
{

    return f0_0 + (f90_0 - f0_0) * 0.0476190485060215;
}


float materialRoughnessForBsdf_0(float roughness_2)
{

    return clamp(max(roughness_2, 0.0020000000949949), 0.0, 1.0);
}

float max3_0(vec3 v_1)
{

    return max(v_1.x, max(v_1.y, v_1.z));
}


float iridescenceInterfaceWeight_0(float iridescence_1, float filmIor_0)
{

    float _S8 = max(filmIor_0, 1.0);

    return clamp(iridescence_1, 0.0, 1.0) * pow((_S8 - 1.0) / max(_S8 + 1.0, 0.00000999999974738), 2.0);
}


struct SurfaceClosure_0
{
    vec3 diffuseColor_0;
    vec3 diffuseReflectionColor_0;
    vec3 transmissionColor_0;
    float diffuseWeight_0;
    float sheenWeight_0;
    float anisotropy_1;
    vec3 anisotropyTangent_1;
    vec3 specularColor_1;
    vec3 specularF90_0;
    vec3 dielectricSpecularColor_0;
    vec3 dielectricSpecularF90_0;
    float dielectricWeight_0;
    float specularWeight_0;
    float clearcoatWeight_0;
    float roughness_3;
    vec3 sheenColor_1;
    float sheenRoughness_1;
    float transparency_1;
    float clearcoat_2;
    float clearcoatRoughness_1;
    vec3 throughput_0;
    float metallic_1;
    float specular_1;
    float ior_2;
    float iridescence_2;
    float iridescenceIor_2;
    float iridescenceThickness_2;
    float dispersion_2;
    float thinWalled_1;
    vec3 attenuationColor_2;
    float attenuationDistance_2;
    vec3 multiscatterColor_1;
    float scatterAnisotropy_2;
    float transmissionWeight_0;
    vec3 diffuseTransmissionColor_0;
    float diffuseTransmissionWeight_0;
};


SurfaceClosure_0 buildSurfaceClosure_0(SurfaceMaterial_0 surface_1, SurfaceLayerNormals_0 layerNormals_0, vec3 anisotropyTangent_2)
{

    float dielectricWeight_1 = 1.0 - surface_1.metallic_0;

    float _S9 = 1.0 - surface_1.transparency_0;

    float opaqueDielectricWeight_0 = dielectricWeight_1 * _S9;
    float transparentDielectricWeight_0 = dielectricWeight_1 * surface_1.transparency_0;
    vec3 diffuseReflectionColor_1 = surface_1.albedo_0 * opaqueDielectricWeight_0 * (1.0 - surface_1.translucency_0);
    vec3 diffuseTransmissionColor_1 = opaqueDielectricWeight_0 * surface_1.translucencyColor_0 * surface_1.translucency_0;

    float iorRatio_0 = (1.0 - surface_1.ior_1) / (1.0 + surface_1.ior_1);

    vec3 dielectricF0_0 = clamp01_0(vec3(iorRatio_0 * iorRatio_0 * surface_1.specular_0) * surface_1.specularColor_0);

    const vec3 _S10 = vec3(1.0);

    vec3 metalSpecularEnergy_0 = schlickAverageWeight_0(surface_1.albedo_0, _S10);
    vec3 weightedTransmissionColor_0 = surface_1.albedo_0 * transparentDielectricWeight_0;
    float materialRoughness_0 = materialRoughnessForBsdf_0(surface_1.roughness_1);
    float clearcoatRoughness_2 = materialRoughnessForBsdf_0(surface_1.clearcoatRoughness_0);

    SurfaceClosure_0 closure_0;
    closure_0.diffuseColor_0 = surface_1.albedo_0;
    closure_0.diffuseReflectionColor_0 = diffuseReflectionColor_1;
    closure_0.transmissionColor_0 = surface_1.albedo_0;
    closure_0.diffuseWeight_0 = max3_0(diffuseReflectionColor_1);
    closure_0.sheenWeight_0 = max3_0(surface_1.sheenColor_0) * _S9;
    closure_0.anisotropy_1 = surface_1.anisotropy_0;
    closure_0.anisotropyTangent_1 = anisotropyTangent_2;
    closure_0.specularColor_1 = surface_1.albedo_0;
    closure_0.specularF90_0 = _S10;
    closure_0.dielectricSpecularColor_0 = dielectricF0_0;
    closure_0.dielectricSpecularF90_0 = vec3(surface_1.specular_0);
    closure_0.dielectricWeight_0 = dielectricWeight_1;


    float filmWeight_0 = iridescenceInterfaceWeight_0(0.0, surface_1.iridescenceIor_1);
    closure_0.specularWeight_0 = max(max3_0(metalSpecularEnergy_0), filmWeight_0) * surface_1.metallic_0;
    closure_0.clearcoatWeight_0 = surface_1.clearcoat_0 * mix(0.20000000298023224, 1.0, 1.0 - clearcoatRoughness_2);
    closure_0.roughness_3 = materialRoughness_0;
    closure_0.sheenColor_1 = surface_1.sheenColor_0;
    closure_0.sheenRoughness_1 = surface_1.sheenRoughness_0;
    closure_0.transparency_1 = surface_1.transparency_0;
    closure_0.clearcoat_2 = surface_1.clearcoat_0;
    closure_0.clearcoatRoughness_1 = clearcoatRoughness_2;
    closure_0.throughput_0 = clamp01_0(diffuseReflectionColor_1 + diffuseTransmissionColor_1 + weightedTransmissionColor_0 + max(metalSpecularEnergy_0, vec3(filmWeight_0)) * surface_1.metallic_0 + dielectricF0_0 * dielectricWeight_1 + surface_1.sheenColor_0);

    closure_0.metallic_1 = surface_1.metallic_0;
    closure_0.specular_1 = surface_1.specular_0;
    closure_0.ior_2 = surface_1.ior_1;
    closure_0.iridescence_2 = 0.0;
    closure_0.iridescenceIor_2 = surface_1.iridescenceIor_1;
    closure_0.iridescenceThickness_2 = surface_1.iridescenceThickness_1;
    closure_0.dispersion_2 = 0.0;
    closure_0.thinWalled_1 = surface_1.thinWalled_0;
    closure_0.attenuationColor_2 = surface_1.attenuationColor_1;
    closure_0.attenuationDistance_2 = surface_1.attenuationDistance_1;
    closure_0.multiscatterColor_1 = surface_1.multiscatterColor_0;
    closure_0.scatterAnisotropy_2 = surface_1.scatterAnisotropy_1;
    closure_0.transmissionWeight_0 = max3_0(surface_1.albedo_0) * transparentDielectricWeight_0;
    closure_0.diffuseTransmissionColor_0 = diffuseTransmissionColor_1;
    closure_0.diffuseTransmissionWeight_0 = max3_0(diffuseTransmissionColor_1);
    return closure_0;
}


SurfaceClosure_0 buildPbrSurfaceClosure_0(SurfaceMaterial_0 surface_2, SurfaceLayerNormals_0 layerNormals_1, vec3 anisotropyTangent_3)
{



    return buildSurfaceClosure_0(surface_2, layerNormals_1, anisotropyTangent_3);
}


struct MaterialBsdfState_0
{
    SurfaceClosure_0 closure_1;
    float currentMediumIor_0;
};


struct TransportContext_0
{
    float currentMediumIor_1;
    float interfaceIor_0;
    float thinWalled_2;
    float _pad0_0;
};


MaterialBsdfState_0 prepareMaterialBsdfState_0(SurfaceMaterial_0 surface_3, SurfaceClosure_0 closure_2, TransportContext_0 transportContext_0)
{


    MaterialBsdfState_0 state_0;
    state_0.closure_1 = closure_2;
    state_0.currentMediumIor_0 = max(transportContext_0.currentMediumIor_1, 1.0);
    return state_0;
}


MaterialBsdfState_0 preparePbrBsdfState_0(SurfaceMaterial_0 surface_4, SurfaceClosure_0 closure_3, TransportContext_0 transportContext_1)
{



    return prepareMaterialBsdfState_0(surface_4, closure_3, transportContext_1);
}


vec3 evalDiffuseTransmission_0(SurfaceClosure_0 closure_4, vec3 normal_0, vec3 lightDir_0)
{
    return closure_4.diffuseTransmissionColor_0 * 0.31830987334251404 * max(abs(dot(normal_0, lightDir_0)), 0.0);
}


float transparentDielectricWeight_1(SurfaceClosure_0 closure_5)
{

    return closure_5.dielectricWeight_0 * closure_5.transparency_1;
}


vec3 projectToAnisotropicFrame_0(vec3 normal_1, vec3 tangent_0, vec3 dir_0)
{

    vec3 safeTangent_0 = normalize(tangent_0 - normal_1 * dot(tangent_0, normal_1));

    return vec3(dot(dir_0, safeTangent_0), dot(dir_0, normalize(cross(normal_1, safeTangent_0))), dot(dir_0, normal_1));
}


vec2 anisotropicAlpha_0(float roughness_4, float anisotropy_2)
{

    float clampedAnisotropy_0 = clamp(anisotropy_2, 0.0, 1.0);
    float _S11 = max(roughness_4 * roughness_4, 0.0);

    return vec2(mix(_S11, 1.0, clampedAnisotropy_0 * clampedAnisotropy_0), _S11);
}


float ggxDistributionAnisotropic_0(vec2 alpha_12, vec3 localH_0)
{

    float _S12 = alpha_12.x;

    float hx_0 = localH_0.x / _S12;
    float _S13 = alpha_12.y;

    float hy_0 = localH_0.y / _S13;
    float _S14 = localH_0.z;
    float denom_0 = hx_0 * hx_0 + hy_0 * hy_0 + _S14 * _S14;
    return 1.0 / max(3.14159274101257324 * _S12 * _S13 * denom_0 * denom_0, 9.999999960041972e-13);
}


float ggxSmithLambdaAnisotropic_0(vec2 alpha_13, vec3 localDir_0)
{

    float _S15 = localDir_0.z;

    float cosTheta2_0 = _S15 * _S15;
    if(cosTheta2_0 <= 9.99999993922529029e-09)
    {

        return 0.0;
    }

    if((max(1.0 - cosTheta2_0, 0.0)) <= 9.99999993922529029e-09)
    {

        return 0.0;
    }

    float _S16 = localDir_0.x;

    float _S17 = alpha_13.x;

    float _S18 = localDir_0.y;

    float _S19 = alpha_13.y;

    return 0.5 * (-1.0 + sqrt(1.0 + (_S16 * _S16 * _S17 * _S17 + _S18 * _S18 * _S19 * _S19) / max(cosTheta2_0, 9.99999993922529029e-09)));
}

float ggxSmithG2Anisotropic_0(vec2 alpha_14, vec3 localView_0, vec3 localLight_0)
{

    return 1.0 / (1.0 + ggxSmithLambdaAnisotropic_0(alpha_14, localView_0) + ggxSmithLambdaAnisotropic_0(alpha_14, localLight_0));
}


vec3 evaluateMicrofacetResponseAnisotropic_0(float roughness_5, float anisotropy_3, vec3 normal_2, vec3 tangent_1, vec3 viewDir_0, vec3 lightDir_1)
{

    vec3 halfVec_0 = normalize(viewDir_0 + lightDir_1);
    vec3 localView_1 = projectToAnisotropicFrame_0(normal_2, tangent_1, viewDir_0);
    vec3 localLight_1 = projectToAnisotropicFrame_0(normal_2, tangent_1, lightDir_1);
    vec3 localHalf_0 = projectToAnisotropicFrame_0(normal_2, tangent_1, halfVec_0);
    float noV_1 = abs(localView_1.z);
    float noL_0 = abs(localLight_1.z);
    float noH_0 = abs(localHalf_0.z);
    float _S20 = max(dot(viewDir_0, halfVec_0), 0.0);

    bool _S21;
    if(noV_1 <= 0.0)
    {

        _S21 = true;

    }
    else
    {

        _S21 = noL_0 <= 0.0;

    }

    if(_S21)
    {

        _S21 = true;

    }
    else
    {

        _S21 = noH_0 <= 0.0;

    }

    if(_S21)
    {

        _S21 = true;

    }
    else
    {

        _S21 = _S20 <= 0.0;

    }

    if(_S21)
    {

        return vec3(0.0);
    }

    vec2 alpha_15 = anisotropicAlpha_0(roughness_5, anisotropy_3);


    return vec3(ggxDistributionAnisotropic_0(alpha_15, localHalf_0) * ggxSmithG2Anisotropic_0(alpha_15, localView_1, localLight_1) / max(4.0 * noV_1 * noL_0, 0.00000999999974738));
}


float directionalAlbedoGGX_0(float alpha_16, float cosTheta_3)
{

    return directionalAlbedoGGXGeneric_0(alpha_16, cosTheta_3);
}

float averageAlbedoGGX_0(float alpha_17)
{

    return averageAlbedoGGXGeneric_0(alpha_17);
}


struct DielectricFresnelAngles_0
{
    float schlickCosTheta_0;
    bool totalInternalReflection_0;
};


DielectricFresnelAngles_0 dielectricFresnelAngles_0(float cosTheta_4, float ni_0, float nt_0, bool thinWalled_3)
{

    float cosI_0 = clamp(cosTheta_4, 0.0, 1.0);
    float eta_0 = ni_0 / max(nt_0, 0.00000999999974738);
    float sinT2_0 = eta_0 * eta_0 * max(1.0 - cosI_0 * cosI_0, 0.0);
    DielectricFresnelAngles_0 result_0;

    bool _S22;
    if(sinT2_0 >= 1.0)
    {

        _S22 = !thinWalled_3;

    }
    else
    {

        _S22 = false;

    }

    if(_S22)
    {

        result_0.schlickCosTheta_0 = 0.0;
        result_0.totalInternalReflection_0 = true;
        return result_0;
    }
    float cosT_0 = sqrt(max(1.0 - sinT2_0, 0.0));
    if(nt_0 >= ni_0)
    {

        _S22 = true;

    }
    else
    {

        _S22 = thinWalled_3;

    }

    float _S23;

    if(_S22)
    {

        _S23 = cosI_0;

    }
    else
    {

        _S23 = cosT_0;

    }

    result_0.schlickCosTheta_0 = _S23;
    result_0.totalInternalReflection_0 = false;
    return result_0;
}


vec3 fresnelSchlick_0(vec3 f0_1, vec3 f90_1, float cosTheta_5)
{

    float m_0 = clamp(1.0 - cosTheta_5, 0.0, 1.0);
    float m2_0 = m_0 * m_0;

    return f0_1 + (f90_1 - f0_1) * (m2_0 * m2_0 * m_0);
}


vec3 fresnelSchlickDielectric_0(float cosTheta_6, vec3 f0_2, vec3 f90_2, float ni_1, float nt_1, bool thinWalled_4)
{

    if((abs(ni_1 - nt_1)) <= 0.00009999999747379)
    {

        return vec3(0.0);
    }
    DielectricFresnelAngles_0 angles_0 = dielectricFresnelAngles_0(cosTheta_6, ni_1, nt_1, thinWalled_4);
    vec3 schlick_0 = fresnelSchlick_0(f0_2, f90_2, angles_0.schlickCosTheta_0);

    vec3 _S24;
    if(angles_0.totalInternalReflection_0)
    {

        _S24 = vec3(1.0);

    }
    else
    {

        _S24 = schlick_0;

    }

    return _S24;
}


vec3 fresnelSchlickAverage_0(vec3 f0_3, vec3 f90_3)
{

    return f0_3 + (f90_3 - f0_3) * 0.0476190485060215;
}


vec3 evaluateDielectricSpecularGGX_0(SurfaceClosure_0 closure_6, vec3 normal_3, vec3 viewDir_1, vec3 lightDir_2, float iorI_0, float iorO_0)
{

    float _S25 = max(dot(normal_3, lightDir_2), 0.0);
    float transparentWeight_0 = transparentDielectricWeight_1(closure_6);

    bool _S26;
    if(_S25 <= 0.0)
    {

        _S26 = true;

    }
    else
    {

        _S26 = transparentWeight_0 <= 0.0;

    }

    if(_S26)
    {

        return vec3(0.0);
    }
    vec3 microfacetResponse_0 = evaluateMicrofacetResponseAnisotropic_0(closure_6.roughness_3, closure_6.anisotropy_1, normal_3, closure_6.anisotropyTangent_1, viewDir_1, lightDir_2);

    float _S27 = max(closure_6.roughness_3 * closure_6.roughness_3, 0.0);



    float eAvg_0 = averageAlbedoGGX_0(_S27);
    float _S28 = 1.0 - eAvg_0;

    float ms_0 = (1.0 - directionalAlbedoGGX_0(_S27, _S25)) * (1.0 - directionalAlbedoGGX_0(_S27, abs(dot(normal_3, viewDir_1)))) / max(3.14159274101257324 * _S28, 9.99999997475242708e-07);
    vec3 regularF_0 = fresnelSchlickDielectric_0(max(dot(viewDir_1, normalize(viewDir_1 + lightDir_2)), 0.0), closure_6.dielectricSpecularColor_0, closure_6.dielectricSpecularF90_0, iorI_0, iorO_0, false);

    vec3 fAvg_0;

    if((abs(iorI_0 - iorO_0)) <= 0.00009999999747379)
    {

        fAvg_0 = vec3(0.0);

    }
    else
    {

        fAvg_0 = fresnelSchlickAverage_0(closure_6.dielectricSpecularColor_0, closure_6.dielectricSpecularF90_0);

    }



    return transparentWeight_0 * (microfacetResponse_0 * regularF_0 + ms_0 * (fAvg_0 * fAvg_0 * eAvg_0 / max(vec3(1.0) - fAvg_0 * _S28, vec3(0.00000999999974738)))) * _S25;
}


vec3 weightedTransmissionColor_1(SurfaceClosure_0 closure_7)
{

    return closure_7.transmissionColor_0 * transparentDielectricWeight_1(closure_7);
}


float maxWeightedComponent_0(vec3 weight_0, vec3 value_0)
{

    const vec3 _S29 = vec3(0.0);
    return max3_0(max(weight_0, _S29) * max(value_0, _S29));
}


vec2 reflectionTransmissionProbabilities_0(vec3 throughput_1, vec3 reflectionCoeff_0, vec3 transmissionCoeff_0)
{

    float reflectionWeight_0 = maxWeightedComponent_0(throughput_1, reflectionCoeff_0);
    float transmissionWeight_1 = maxWeightedComponent_0(throughput_1, transmissionCoeff_0);
    float totalWeight_0 = reflectionWeight_0 + transmissionWeight_1;
    if(totalWeight_0 <= 0.00000999999974738)
    {

        return vec2(1.0, 0.0);
    }
    return vec2(reflectionWeight_0 / totalWeight_0, transmissionWeight_1 / totalWeight_0);
}


struct DielectricTransmissionCoefficients_0
{
    vec3 reflectionCoeff_1;
    vec3 transmissionCoeff_1;
    float reflectionProb_0;
    float transmissionProb_0;
};


DielectricTransmissionCoefficients_0 computeDielectricTransmissionCoefficients_0(SurfaceClosure_0 closure_8, float currentMediumIor_2, vec3 baseNormal_0, vec3 viewDir_2, float iorI_1, float iorO_1)
{

    vec3 fresnelReflect_0 = fresnelSchlickDielectric_0(max(dot(baseNormal_0, viewDir_2), 0.00000999999974738), closure_8.dielectricSpecularColor_0, closure_8.dielectricSpecularF90_0, iorI_1, iorO_1, false);

    vec3 reflectionCoeff_2 = fresnelReflect_0 * transparentDielectricWeight_1(closure_8);
    vec3 transmissionCoeff_2 = (vec3(1.0) - fresnelReflect_0) * weightedTransmissionColor_1(closure_8);

    vec2 probs_0 = reflectionTransmissionProbabilities_0(max(closure_8.throughput_0, vec3(max(currentMediumIor_2, 0.00000999999974738))), reflectionCoeff_2, transmissionCoeff_2);

    DielectricTransmissionCoefficients_0 coeffs_0;
    coeffs_0.reflectionCoeff_1 = reflectionCoeff_2;
    coeffs_0.transmissionCoeff_1 = transmissionCoeff_2;
    coeffs_0.reflectionProb_0 = probs_0.x;
    coeffs_0.transmissionProb_0 = probs_0.y;
    return coeffs_0;
}


vec3 flipAcrossNormal_0(vec3 v_2, vec3 n_0)
{

    return normalize(v_2 - 2.0 * n_0 * dot(v_2, n_0));
}


vec3 evaluateThinTransmissionScattering_0(SurfaceClosure_0 closure_9, vec3 normal_4, vec3 viewDir_3, vec3 lightDir_3, float iorI_2, float iorO_2)
{

    float _S30 = dot(normal_4, lightDir_3);

    if((dot(normal_4, viewDir_3) * _S30) >= 0.0)
    {

        return vec3(0.0);
    }
    vec3 mirroredLightDir_0 = flipAcrossNormal_0(lightDir_3, normal_4);


    vec3 regularReflect_0 = fresnelSchlickDielectric_0(max(dot(viewDir_3, normalize(viewDir_3 + mirroredLightDir_0)), 0.00000999999974738), closure_9.dielectricSpecularColor_0, closure_9.dielectricSpecularF90_0, iorI_2, iorO_2, true);

    return weightedTransmissionColor_1(closure_9) * (vec3(1.0) - regularReflect_0) * evaluateMicrofacetResponseAnisotropic_0(closure_9.roughness_3, closure_9.anisotropy_1, normal_4, closure_9.anisotropyTangent_1, viewDir_3, mirroredLightDir_0) * abs(_S30);
}

vec3 evaluateThickTransmissionScattering_0(SurfaceClosure_0 closure_10, vec3 transmissionCoeff_3, vec3 normal_5, vec3 viewDir_4, vec3 lightDir_4, float iorI_3, float iorO_3)
{

    vec3 localView_2 = projectToAnisotropicFrame_0(normal_5, closure_10.anisotropyTangent_1, viewDir_4);
    vec3 localLight_2 = projectToAnisotropicFrame_0(normal_5, closure_10.anisotropyTangent_1, lightDir_4);
    float noV_2 = abs(localView_2.z);
    float noL_1 = abs(localLight_2.z);

    bool _S31;
    if(noV_2 <= 0.00000999999974738)
    {

        _S31 = true;

    }
    else
    {

        _S31 = noL_1 <= 0.00000999999974738;

    }

    if(_S31)
    {

        _S31 = true;

    }
    else
    {

        _S31 = (dot(normal_5, viewDir_4) * dot(normal_5, lightDir_4)) >= 0.0;

    }

    if(_S31)
    {

        return vec3(0.0);
    }

    float etaRatio_0 = iorO_3 / max(iorI_3, 0.00000999999974738);
    vec3 halfVec_1 = - normalize(viewDir_4 + lightDir_4 * etaRatio_0);
    vec3 localHalf_1 = projectToAnisotropicFrame_0(normal_5, closure_10.anisotropyTangent_1, halfVec_1);

    float voH_0 = dot(viewDir_4, halfVec_1);
    float loH_0 = dot(lightDir_4, halfVec_1);
    if((abs(localHalf_1.z)) <= 0.00000999999974738)
    {

        _S31 = true;

    }
    else
    {

        _S31 = (voH_0 * loH_0) >= 0.0;

    }

    if(_S31)
    {

        return vec3(0.0);
    }

    vec2 alpha_18 = anisotropicAlpha_0(closure_10.roughness_3, closure_10.anisotropy_1);
    float d_0 = ggxDistributionAnisotropic_0(alpha_18, localHalf_1);
    float g_0 = ggxSmithG2Anisotropic_0(alpha_18, localView_2, localLight_2);

    float factor_0 = etaRatio_0 * etaRatio_0 * abs(voH_0) * abs(loH_0) / max(pow(voH_0 + etaRatio_0 * loH_0, 2.0) * noV_2, 0.00000999999974738);

    return transmissionCoeff_3 * d_0 * g_0 * factor_0;
}

vec3 evaluateThickTransmissionScatteringDispersed_0(SurfaceClosure_0 closure_11, vec3 transmissionCoeff_4, vec3 normal_6, vec3 viewDir_5, vec3 lightDir_5, float iorI_4, float iorO_4, bool insideMedium_0)
{

    return evaluateThickTransmissionScattering_0(closure_11, transmissionCoeff_4, normal_6, viewDir_5, lightDir_5, iorI_4, iorO_4);
}


vec3 evalDielectricTransmission_0(SurfaceClosure_0 closure_12, float currentMediumIor_3, vec3 normal_7, vec3 viewDir_6, vec3 lightDir_6)
{

    float _S32 = max(currentMediumIor_3, 1.0);

    bool insideMedium_1;
    if(_S32 > 1.00010001659393311)
    {

        insideMedium_1 = (closure_12.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_1 = false;

    }

    float iorI_5;
    if(insideMedium_1)
    {

        iorI_5 = _S32;

    }
    else
    {

        iorI_5 = 1.0;

    }

    float iorO_5;
    if(insideMedium_1)
    {

        iorO_5 = 1.0;

    }
    else
    {

        iorO_5 = closure_12.ior_2;

    }

    if((dot(normal_7, viewDir_6) * dot(normal_7, lightDir_6)) > 0.0)
    {

        return evaluateDielectricSpecularGGX_0(closure_12, normal_7, viewDir_6, lightDir_6, iorI_5, iorO_5);
    }

    DielectricTransmissionCoefficients_0 coeffs_1 = computeDielectricTransmissionCoefficients_0(closure_12, currentMediumIor_3, normal_7, viewDir_6, iorI_5, iorO_5);

    vec3 _S33;

    if((closure_12.thinWalled_1) > 0.5)
    {

        _S33 = evaluateThinTransmissionScattering_0(closure_12, normal_7, viewDir_6, lightDir_6, iorI_5, iorO_5);

    }
    else
    {

        _S33 = evaluateThickTransmissionScatteringDispersed_0(closure_12, coeffs_1.transmissionCoeff_1, normal_7, viewDir_6, lightDir_6, iorI_5, iorO_5, insideMedium_1);

    }

    return _S33;
}


float directionalAlbedoGGXMs_0(float theta_3, float alpha_19, float e0_6)
{

    return directionalAlbedoGGXMsGeneric_0(theta_3, alpha_19, e0_6);
}

float averageAlbedoGGXMs_0(float alpha_20, float e0_7)
{

    return averageAlbedoGGXMsGeneric_0(alpha_20, e0_7);
}


float coupledDiffuseFactor_0(SurfaceClosure_0 closure_13, float noV_3, float noL_2)
{

    float _S34 = closure_13.roughness_3;
    float _S35 = max(_S34 * _S34, 0.0);
    float e0_8 = max3_0(closure_13.dielectricSpecularColor_0 * closure_13.dielectricWeight_0);

    return mix(0.31830987334251404, (1.0 - directionalAlbedoGGXMs_0(noL_2, _S35, e0_8)) * (1.0 - directionalAlbedoGGXMs_0(noV_3, _S35, e0_8)) / max(3.14159274101257324 * (1.0 - averageAlbedoGGXMs_0(_S35, e0_8)), 9.99999997475242708e-07), closure_13.specular_1);
}


vec3 thinSharedSpecularColor_0(SurfaceClosure_0 closure_14)
{

    return closure_14.dielectricSpecularColor_0 * closure_14.dielectricWeight_0 + closure_14.specularColor_1 * closure_14.metallic_1;
}

vec3 thinSharedSpecularF90_0(SurfaceClosure_0 closure_15)
{

    return closure_15.dielectricSpecularF90_0 * closure_15.dielectricWeight_0 + vec3(closure_15.metallic_1);
}


vec3 closureDiffuseEnergy_0(SurfaceClosure_0 closure_16)
{


    const vec3 _S36 = vec3(1.0);

    return clamp(_S36 - (fresnelSchlickAverage_0(closure_16.specularColor_1, closure_16.specularF90_0) * closure_16.metallic_1 + fresnelSchlickAverage_0(closure_16.dielectricSpecularColor_0, closure_16.dielectricSpecularF90_0) * closure_16.dielectricWeight_0), vec3(0.0), _S36);
}


float transmissiveDiffuseCompensationFactor_0(SurfaceClosure_0 closure_17, float noV_4, float noL_3)
{

    float coupled_0 = coupledDiffuseFactor_0(closure_17, noV_4, noL_3);
    bool _S37 = (closure_17.thinWalled_1) > 0.5;

    vec3 sharedSpecularColor_0;

    if(_S37)
    {

        sharedSpecularColor_0 = thinSharedSpecularColor_0(closure_17);

    }
    else
    {

        sharedSpecularColor_0 = closure_17.dielectricSpecularColor_0;

    }

    vec3 sharedSpecularF90_0;
    if(_S37)
    {

        sharedSpecularF90_0 = thinSharedSpecularF90_0(closure_17);

    }
    else
    {

        sharedSpecularF90_0 = closure_17.dielectricSpecularF90_0;

    }
    float sharedF0_0 = max3_0(sharedSpecularColor_0);

    float _S38 = max3_0(sharedSpecularF90_0) - sharedF0_0;

    return coupled_0 * mix(1.0, 1.0 / max(max3_0(closureDiffuseEnergy_0(closure_17)), 0.00009999999747379), sqrt(0.5 * (clamp(sharedF0_0 + _S38 * pow(1.0 - clamp(noV_4, 0.0, 1.0), 5.0), 0.0, 1.0) + clamp(sharedF0_0 + _S38 * pow(1.0 - clamp(noL_3, 0.0, 1.0), 5.0), 0.0, 1.0))));
}


vec3 evalDiffuseReflection_0(SurfaceClosure_0 closure_18, vec3 normal_8, vec3 viewDir_7, vec3 lightDir_7)
{

    float _S39 = max(dot(normal_8, lightDir_7), 0.0);

    bool _S40;
    if((closure_18.specular_1) <= 0.00000999999974738)
    {

        _S40 = (closure_18.transparency_1) <= 0.0;

    }
    else
    {

        _S40 = false;

    }

    if(_S40)
    {

        return closure_18.diffuseReflectionColor_0 * 0.31830987334251404 * _S39;
    }
    float _S41 = max(abs(dot(viewDir_7, normal_8)), 0.0);

    float factor_1;

    if((closure_18.transparency_1) > 0.0)
    {

        factor_1 = transmissiveDiffuseCompensationFactor_0(closure_18, _S41, _S39);

    }
    else
    {

        factor_1 = coupledDiffuseFactor_0(closure_18, _S41, _S39);

    }

    return closure_18.diffuseReflectionColor_0 * factor_1 * _S39;
}


bool isThinTransmissiveDielectric_0(SurfaceClosure_0 closure_19)
{

    bool _S42;

    if((closure_19.thinWalled_1) > 0.5)
    {

        if((closure_19.transparency_1) > 0.0)
        {

            _S42 = true;

        }
        else
        {

            _S42 = (closure_19.diffuseTransmissionWeight_0) > 0.0;

        }

    }
    else
    {

        _S42 = false;

    }
    if(_S42)
    {

        _S42 = (closure_19.metallic_1) < 1.0;

    }
    else
    {

        _S42 = false;

    }

    return _S42;
}


vec3 evaluateThinSharedSpecularGGX_0(SurfaceClosure_0 closure_20, vec3 normal_9, vec3 viewDir_8, vec3 lightDir_8)
{

    float _S43 = max(dot(normal_9, lightDir_8), 0.0);
    if(_S43 <= 0.0)
    {

        return vec3(0.0);
    }
    vec3 microfacetResponse_1 = evaluateMicrofacetResponseAnisotropic_0(closure_20.roughness_3, closure_20.anisotropy_1, normal_9, closure_20.anisotropyTangent_1, viewDir_8, lightDir_8);

    float _S44 = max(closure_20.roughness_3 * closure_20.roughness_3, 0.0);



    float eAvg_1 = averageAlbedoGGX_0(_S44);
    float _S45 = 1.0 - eAvg_1;

    float ms_1 = (1.0 - directionalAlbedoGGX_0(_S44, _S43)) * (1.0 - directionalAlbedoGGX_0(_S44, abs(dot(normal_9, viewDir_8)))) / max(3.14159274101257324 * _S45, 9.99999997475242708e-07);
    vec3 f0_4 = thinSharedSpecularColor_0(closure_20);
    vec3 f90_4 = thinSharedSpecularF90_0(closure_20);
    vec3 f_0 = fresnelSchlick_0(f0_4, f90_4, max(dot(viewDir_8, normalize(viewDir_8 + lightDir_8)), 0.0));

    vec3 fAvg_1 = fresnelSchlickAverage_0(f0_4, f90_4);

    return (microfacetResponse_1 * f_0 + ms_1 * (fAvg_1 * fAvg_1 * eAvg_1 / max(vec3(1.0) - fAvg_1 * _S45, vec3(0.00000999999974738)))) * _S43;
}


vec3 evaluateBaseSpecularGGX_0(SurfaceClosure_0 closure_21, vec3 normal_10, vec3 viewDir_9, vec3 lightDir_9)
{



    vec3 microfacetResponse_2 = evaluateMicrofacetResponseAnisotropic_0(closure_21.roughness_3, closure_21.anisotropy_1, normal_10, closure_21.anisotropyTangent_1, viewDir_9, lightDir_9);

    float _S46 = max(dot(viewDir_9, normalize(viewDir_9 + lightDir_9)), 0.0);
    float _S47 = max(closure_21.roughness_3 * closure_21.roughness_3, 0.0);

    float eAvg_2 = averageAlbedoGGX_0(_S47);
    float _S48 = 1.0 - eAvg_2;

    float ms_2 = (1.0 - directionalAlbedoGGX_0(_S47, abs(dot(normal_10, lightDir_9)))) * (1.0 - directionalAlbedoGGX_0(_S47, abs(dot(normal_10, viewDir_9)))) / max(3.14159274101257324 * _S48, 9.99999997475242708e-07);

    vec3 metalFAvg_0 = fresnelSchlickAverage_0(closure_21.specularColor_1, closure_21.specularF90_0);
    const vec3 _S49 = vec3(1.0);

    const vec3 _S50 = vec3(0.00000999999974738);

    vec3 dielectricFAvg_0 = fresnelSchlickAverage_0(closure_21.dielectricSpecularColor_0, closure_21.dielectricSpecularF90_0);


    return closure_21.metallic_1 * (microfacetResponse_2 * fresnelSchlick_0(closure_21.specularColor_1, closure_21.specularF90_0, _S46) + ms_2 * (metalFAvg_0 * metalFAvg_0 * eAvg_2 / max(_S49 - metalFAvg_0 * _S48, _S50))) + closure_21.dielectricWeight_0 * (1.0 - closure_21.transparency_1) * (microfacetResponse_2 * fresnelSchlick_0(closure_21.dielectricSpecularColor_0, closure_21.dielectricSpecularF90_0, _S46) + ms_2 * (dielectricFAvg_0 * dielectricFAvg_0 * eAvg_2 / max(_S49 - dielectricFAvg_0 * _S48, _S50)));
}


vec3 evalBaseSpecular_0(SurfaceClosure_0 closure_22, vec3 normal_11, vec3 viewDir_10, vec3 lightDir_10)
{

    float _S51 = max(dot(normal_11, lightDir_10), 0.0);
    if(isThinTransmissiveDielectric_0(closure_22))
    {

        return evaluateThinSharedSpecularGGX_0(closure_22, normal_11, viewDir_10, lightDir_10);
    }
    return evaluateBaseSpecularGGX_0(closure_22, normal_11, viewDir_10, lightDir_10) * _S51;
}


float sheenAlpha_0(float roughness_6)
{

    return max(roughness_6 * roughness_6, 0.0);
}


float sheenLogApprox_0(float x_0, float alpha_21)
{

    float _S52 = 1.0 - alpha_21;

    float oneMinusAlphaSq_0 = _S52 * _S52;

    return mix(21.54730033874511719, 25.32449913024902344, oneMinusAlphaSq_0) / (1.0 + mix(3.82986998558044434, 3.32435011863708496, oneMinusAlphaSq_0) * pow(abs(x_0), mix(0.19822999835014343, 0.16800999641418457, oneMinusAlphaSq_0))) + mix(-1.97759997844696045, -1.27392995357513428, oneMinusAlphaSq_0) * x_0 + mix(-4.32053995132446289, -4.85967016220092773, oneMinusAlphaSq_0);
}

float lambdaSheen_0(float cosTheta_7, float alpha_22)
{

    float _S53;

    if((abs(cosTheta_7)) >= 0.5)
    {

        _S53 = exp(2.0 * sheenLogApprox_0(0.5, alpha_22) - sheenLogApprox_0(1.0 - cosTheta_7, alpha_22));

    }
    else
    {

        _S53 = exp(sheenLogApprox_0(cosTheta_7, alpha_22));

    }

    return _S53;
}


vec3 evalSheen_0(SurfaceClosure_0 closure_23, vec3 normal_12, vec3 viewDir_11, vec3 lightDir_11)
{

    if((max3_0(closure_23.sheenColor_1)) <= 0.0)
    {

        return vec3(0.0);
    }

    float _S54 = max(dot(normal_12, viewDir_11), 0.0);
    float _S55 = max(dot(normal_12, lightDir_11), 0.0);
    float _S56 = max(dot(normal_12, normalize(viewDir_11 + lightDir_11)), 0.0);

    bool _S57;
    if(_S54 <= 0.0)
    {

        _S57 = true;

    }
    else
    {

        _S57 = _S55 <= 0.0;

    }

    if(_S57)
    {

        _S57 = true;

    }
    else
    {

        _S57 = _S56 <= 0.0;

    }

    if(_S57)
    {

        return vec3(0.0);
    }

    float alpha_23 = sheenAlpha_0(closure_23.sheenRoughness_1);
    float invAlpha_0 = 1.0 / max(alpha_23, 0.00000999999974738);



    return closure_23.sheenColor_1 * (1.0 / (1.0 + lambdaSheen_0(_S54, alpha_23) + lambdaSheen_0(_S55, alpha_23)) * ((2.0 + invAlpha_0) * pow(abs(max(1.0 - _S56 * _S56, 0.00100000004749745)), 0.5 * invAlpha_0) / 6.28318548202514648) / max(4.0 * _S54 * _S55, 0.00000999999974738)) * _S55;
}


vec3 evaluateReflectedBaseScattering_0(MaterialBsdfState_0 state_1, vec3 baseNormal_1, vec3 viewDir_12, vec3 lightDir_12)
{

    return evalDiffuseReflection_0(state_1.closure_1, baseNormal_1, viewDir_12, lightDir_12) + evalBaseSpecular_0(state_1.closure_1, baseNormal_1, viewDir_12, lightDir_12) + evalSheen_0(state_1.closure_1, baseNormal_1, viewDir_12, lightDir_12);
}


float ggxDistribution_0(float alpha_24, float noH_1)
{

    float a2_0 = alpha_24 * alpha_24;
    float d_1 = noH_1 * noH_1 * (a2_0 - 1.0) + 1.0;
    return a2_0 / max(3.14159274101257324 * d_1 * d_1, 9.999999960041972e-13);
}


float ggxSmithLambda_0(float alpha_25, float noX_0)
{

    float cosTheta_8 = abs(noX_0);
    float _S58 = cosTheta_8 * cosTheta_8;

    float _S59 = max(1.0 - _S58, 0.0);

    bool _S60;
    if(_S59 <= 9.99999993922529029e-09)
    {

        _S60 = true;

    }
    else
    {

        _S60 = cosTheta_8 <= 9.99999993922529029e-09;

    }

    if(_S60)
    {

        return 0.0;
    }

    return 0.5 * (-1.0 + sqrt(1.0 + alpha_25 * alpha_25 * (_S59 / max(_S58, 9.99999993922529029e-09))));
}

float ggxSmithG2_0(float alpha_26, float noV_5, float noL_4)
{

    return 1.0 / (1.0 + ggxSmithLambda_0(alpha_26, noV_5) + ggxSmithLambda_0(alpha_26, noL_4));
}


vec3 evaluateMicrofacetGGX_0(vec3 specularColor_2, vec3 specularF90_1, float roughness_7, vec3 normal_13, vec3 viewDir_13, vec3 lightDir_13)
{

    vec3 halfVec_2 = normalize(viewDir_13 + lightDir_13);
    float _S61 = max(dot(normal_13, viewDir_13), 0.0);
    float _S62 = max(dot(normal_13, lightDir_13), 0.0);
    float _S63 = max(dot(normal_13, halfVec_2), 0.0);
    float _S64 = max(dot(viewDir_13, halfVec_2), 0.0);

    bool _S65;
    if(_S61 <= 0.0)
    {

        _S65 = true;

    }
    else
    {

        _S65 = _S62 <= 0.0;

    }

    if(_S65)
    {

        _S65 = true;

    }
    else
    {

        _S65 = _S63 <= 0.0;

    }

    if(_S65)
    {

        _S65 = true;

    }
    else
    {

        _S65 = _S64 <= 0.0;

    }

    if(_S65)
    {

        return vec3(0.0);
    }

    float _S66 = max(roughness_7 * roughness_7, 0.0);



    return fresnelSchlick_0(specularColor_2, specularF90_1, _S64) * ggxDistribution_0(_S66, _S63) * ggxSmithG2_0(_S66, _S61, _S62) / max(4.0 * _S61 * _S62, 0.00000999999974738);
}


vec3 evaluateClearcoatGGX_0(SurfaceClosure_0 closure_24, vec3 normal_14, vec3 viewDir_14, vec3 lightDir_14)
{

    if((closure_24.clearcoat_2) <= 0.0)
    {

        return vec3(0.0);
    }
    return closure_24.clearcoat_2 * evaluateMicrofacetGGX_0(vec3(0.03999999910593033), vec3(1.0), closure_24.clearcoatRoughness_1, normal_14, viewDir_14, lightDir_14);
}


vec3 evalClearcoat_0(SurfaceClosure_0 closure_25, vec3 normal_15, vec3 viewDir_15, vec3 lightDir_15)
{
    return evaluateClearcoatGGX_0(closure_25, normal_15, viewDir_15, lightDir_15) * max(dot(normal_15, lightDir_15), 0.0);
}


float clearcoatBaseWeight_0(SurfaceClosure_0 closure_26, vec3 clearcoatNormal_0, vec3 viewDir_16, vec3 lightDir_16)
{

    if((closure_26.clearcoat_2) <= 0.0)
    {

        return 1.0;
    }


    const vec3 _S67 = vec3(0.03999999910593033);

    const vec3 _S68 = vec3(1.0);

    return clamp(1.0 - closure_26.clearcoat_2 * max(max3_0(fresnelSchlick_0(_S67, _S68, abs(dot(clearcoatNormal_0, viewDir_16)))), max3_0(fresnelSchlick_0(_S67, _S68, abs(dot(clearcoatNormal_0, lightDir_16))))), 0.0, 1.0);
}


vec3 evalMaterialBsdfMixture_0(MaterialBsdfState_0 state_2, vec3 baseNormal_2, vec3 clearcoatNormal_1, vec3 viewDir_17, vec3 lightDir_17)
{

    if(!((dot(baseNormal_2, viewDir_17) * dot(baseNormal_2, lightDir_17)) > 0.0))
    {

        return evalDiffuseTransmission_0(state_2.closure_1, baseNormal_2, lightDir_17) + evalDielectricTransmission_0(state_2.closure_1, state_2.currentMediumIor_0, baseNormal_2, viewDir_17, lightDir_17);
    }


    vec3 base_1 = evaluateReflectedBaseScattering_0(state_2, baseNormal_2, viewDir_17, lightDir_17);

    bool _S69;
    if((state_2.closure_1.thinWalled_1) < 0.5)
    {

        _S69 = (state_2.closure_1.transparency_1) > 0.0;

    }
    else
    {

        _S69 = false;

    }

    vec3 base_2;

    if(_S69)
    {

        base_2 = base_1 + evalDielectricTransmission_0(state_2.closure_1, state_2.currentMediumIor_0, baseNormal_2, viewDir_17, lightDir_17);

    }
    else
    {

        base_2 = base_1;

    }



    return evalClearcoat_0(state_2.closure_1, clearcoatNormal_1, viewDir_17, lightDir_17) + base_2 * clearcoatBaseWeight_0(state_2.closure_1, clearcoatNormal_1, viewDir_17, lightDir_17);
}


struct DirectionContext_0
{
    vec3 viewDir_18;
    vec3 lightDir_18;
};


struct NormalContext_0
{
    vec3 rawGeometryNormal_0;
    vec3 transmissionNormal_0;
    vec3 baseNormal_3;
    vec3 clearcoatNormal_2;
};


vec3 evalMaterialBsdf_0(MaterialBsdfState_0 state_3, DirectionContext_0 directions_0, NormalContext_0 normals_1)
{

    return evalMaterialBsdfMixture_0(state_3, normals_1.baseNormal_3, normals_1.clearcoatNormal_2, directions_0.viewDir_18, directions_0.lightDir_18);
}


vec3 evalPbrBsdf_0(MaterialBsdfState_0 state_4, DirectionContext_0 directions_1, NormalContext_0 normals_2)
{
    return evalMaterialBsdf_0(state_4, directions_1, normals_2);
}


float thinInterfaceBaseProbability_0(SurfaceClosure_0 closure_27, float currentMediumIor_4, vec3 baseNormal_4, vec3 viewDir_19)
{

    return clamp(1.0 - max3_0(fresnelSchlick_0(thinSharedSpecularColor_0(closure_27), thinSharedSpecularF90_0(closure_27), max(abs(dot(baseNormal_4, viewDir_19)), 0.00000999999974738))), 0.0, 1.0);
}


float transmissiveBaseLayerWeight_0(SurfaceClosure_0 closure_28)
{

    return max(closure_28.diffuseWeight_0 + closure_28.sheenWeight_0 + closure_28.diffuseTransmissionWeight_0 + closure_28.transmissionWeight_0, 0.00000999999974738);
}


float pdfDiffuseTransmission_0(vec3 normal_16, vec3 lightDir_19)
{

    return max(dot(- normal_16, lightDir_19), 0.0) * 0.31830987334251404;
}


float sampleSpecularLobePdf_0(SurfaceClosure_0 closure_29, vec3 normal_17, vec3 viewDir_20, vec3 dir_1)
{

    vec3 halfVec_3 = normalize(viewDir_20 + dir_1);
    vec3 localHalf_2 = projectToAnisotropicFrame_0(normal_17, closure_29.anisotropyTangent_1, halfVec_3);
    float noH_2 = abs(localHalf_2.z);
    float _S70 = max(dot(viewDir_20, halfVec_3), 0.0);

    bool _S71;
    if(noH_2 <= 0.0)
    {

        _S71 = true;

    }
    else
    {

        _S71 = _S70 <= 0.0;

    }

    if(_S71)
    {

        return 0.0;
    }



    return ggxDistributionAnisotropic_0(anisotropicAlpha_0(closure_29.roughness_3, closure_29.anisotropy_1), localHalf_2) * noH_2 / max(4.0 * _S70, 0.00000999999974738);
}


float ggxSmithG1Anisotropic_0(vec2 alpha_27, vec3 localDir_1)
{

    return 1.0 / (1.0 + ggxSmithLambdaAnisotropic_0(alpha_27, localDir_1));
}


float evaluateThickTransmissionPdf_0(SurfaceClosure_0 closure_30, vec3 normal_18, vec3 viewDir_21, vec3 lightDir_20, float iorI_6, float iorO_6)
{

    vec3 localView_3 = projectToAnisotropicFrame_0(normal_18, closure_30.anisotropyTangent_1, viewDir_21);

    float noV_6 = abs(localView_3.z);
    float noL_5 = abs(projectToAnisotropicFrame_0(normal_18, closure_30.anisotropyTangent_1, lightDir_20).z);

    bool _S72;
    if(noV_6 <= 0.00000999999974738)
    {

        _S72 = true;

    }
    else
    {

        _S72 = noL_5 <= 0.00000999999974738;

    }

    if(_S72)
    {

        _S72 = true;

    }
    else
    {

        _S72 = (dot(normal_18, viewDir_21) * dot(normal_18, lightDir_20)) >= 0.0;

    }

    if(_S72)
    {

        return 0.0;
    }

    float etaRatio_1 = iorO_6 / max(iorI_6, 0.00000999999974738);
    vec3 halfVec_4 = - normalize(viewDir_21 + lightDir_20 * etaRatio_1);
    vec3 localHalf_3 = projectToAnisotropicFrame_0(normal_18, closure_30.anisotropyTangent_1, halfVec_4);

    float voH_1 = dot(viewDir_21, halfVec_4);
    float loH_1 = dot(lightDir_20, halfVec_4);
    if((abs(localHalf_3.z)) <= 0.00000999999974738)
    {

        _S72 = true;

    }
    else
    {

        _S72 = (voH_1 * loH_1) >= 0.0;

    }

    if(_S72)
    {

        return 0.0;
    }

    vec2 alpha_28 = anisotropicAlpha_0(closure_30.roughness_3, closure_30.anisotropy_1);

    return ggxDistributionAnisotropic_0(alpha_28, localHalf_3) * ggxSmithG1Anisotropic_0(alpha_28, localView_3) * (etaRatio_1 * etaRatio_1 * abs(voH_1) * abs(loH_1) / max(pow(voH_1 + etaRatio_1 * loH_1, 2.0) * noV_6, 0.00000999999974738));
}


float pdfDielectricTransmission_0(SurfaceClosure_0 closure_31, float currentMediumIor_5, vec3 normal_19, vec3 viewDir_22, vec3 lightDir_21)
{

    float _S73 = max(currentMediumIor_5, 1.0);

    bool insideMedium_2;
    if(_S73 > 1.00010001659393311)
    {

        insideMedium_2 = (closure_31.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_2 = false;

    }

    float iorI_7;
    if(insideMedium_2)
    {

        iorI_7 = _S73;

    }
    else
    {

        iorI_7 = 1.0;

    }

    float iorO_7;
    if(insideMedium_2)
    {

        iorO_7 = 1.0;

    }
    else
    {

        iorO_7 = closure_31.ior_2;

    }
    DielectricTransmissionCoefficients_0 coeffs_2 = computeDielectricTransmissionCoefficients_0(closure_31, currentMediumIor_5, normal_19, viewDir_22, iorI_7, iorO_7);

    if((dot(normal_19, viewDir_22) * dot(normal_19, lightDir_21)) < 0.0)
    {

        float _S74 = max(coeffs_2.transmissionProb_0, 0.00000999999974738);

        float lobePdf_0;

        if((closure_31.thinWalled_1) > 0.5)
        {

            lobePdf_0 = sampleSpecularLobePdf_0(closure_31, normal_19, viewDir_22, flipAcrossNormal_0(lightDir_21, normal_19));

        }
        else
        {

            lobePdf_0 = evaluateThickTransmissionPdf_0(closure_31, normal_19, viewDir_22, lightDir_21, iorI_7, iorO_7);

        }

        return max(_S74 * lobePdf_0, 0.00000999999974738);
    }


    return max(clamp(coeffs_2.reflectionProb_0, 0.0, 1.0) * sampleSpecularLobePdf_0(closure_31, normal_19, viewDir_22, lightDir_21), 0.00000999999974738);
}


float pdfDiffuseReflection_0(vec3 normal_20, vec3 lightDir_22)
{

    return max(dot(normal_20, lightDir_22), 0.0) * 0.31830987334251404;
}


float pdfSheen_0(vec3 normal_21, vec3 lightDir_23)
{

    return max(dot(normal_21, lightDir_23), 0.0) * 0.31830987334251404;
}


float pdfBaseSpecular_0(SurfaceClosure_0 closure_32, vec3 normal_22, vec3 viewDir_23, vec3 lightDir_24)
{

    return sampleSpecularLobePdf_0(closure_32, normal_22, viewDir_23, lightDir_24);
}


float sampleSpecularLobePdfIsotropic_0(vec3 normal_23, vec3 viewDir_24, float roughness_8, vec3 dir_2)
{

    vec3 halfVec_5 = normalize(viewDir_24 + dir_2);
    float _S75 = max(dot(normal_23, halfVec_5), 0.0);
    float _S76 = max(dot(viewDir_24, halfVec_5), 0.0);

    bool _S77;
    if(_S75 <= 0.0)
    {

        _S77 = true;

    }
    else
    {

        _S77 = _S76 <= 0.0;

    }

    if(_S77)
    {

        return 0.0;
    }



    return ggxDistribution_0(max(roughness_8 * roughness_8, 0.0), _S75) * _S75 / max(4.0 * _S76, 0.00000999999974738);
}


float pdfClearcoat_0(SurfaceClosure_0 closure_33, vec3 normal_24, vec3 viewDir_25, vec3 lightDir_25)
{

    float _S78;

    if((max(dot(normal_24, lightDir_25), 0.0)) > 0.0)
    {

        _S78 = sampleSpecularLobePdfIsotropic_0(normal_24, viewDir_25, closure_33.clearcoatRoughness_1, lightDir_25);

    }
    else
    {

        _S78 = 0.0;

    }

    return _S78;
}


float dielectricViewFresnelMax_0(SurfaceClosure_0 closure_34, vec3 baseNormal_5, vec3 viewDir_26)
{
    return max3_0(fresnelSchlick_0(closure_34.dielectricSpecularColor_0, closure_34.dielectricSpecularF90_0, max(dot(baseNormal_5, viewDir_26), 0.0)));
}


float pdfMaterialBsdfMixture_0(MaterialBsdfState_0 state_5, vec3 baseNormal_6, vec3 clearcoatNormal_3, vec3 viewDir_27, vec3 dir_3)
{

    float _S79 = dot(baseNormal_6, dir_3);

    float _S80 = max(_S79, 0.0);
    float _S81 = max(dot(clearcoatNormal_3, dir_3), 0.0);
    bool transmissionSide_0 = (dot(baseNormal_6, viewDir_27) * _S79) < 0.0;
    bool thinDielectric_0 = isThinTransmissiveDielectric_0(state_5.closure_1);

    float thinBaseProb_0;
    if(thinDielectric_0)
    {

        thinBaseProb_0 = thinInterfaceBaseProbability_0(state_5.closure_1, state_5.currentMediumIor_0, baseNormal_6, viewDir_27);

    }
    else
    {

        thinBaseProb_0 = 0.0;

    }

    float thinSpecularProb_0;
    if(thinDielectric_0)
    {

        thinSpecularProb_0 = 1.0 - thinBaseProb_0;

    }
    else
    {

        thinSpecularProb_0 = 0.0;

    }

    float pdf_0;
    if(transmissionSide_0)
    {

        if(thinDielectric_0)
        {

            float baseLayerWeight_0 = transmissiveBaseLayerWeight_0(state_5.closure_1);

            if((state_5.closure_1.diffuseTransmissionWeight_0) > 0.0)
            {

                pdf_0 = thinBaseProb_0 * (state_5.closure_1.diffuseTransmissionWeight_0 / baseLayerWeight_0) * pdfDiffuseTransmission_0(baseNormal_6, dir_3);

            }
            else
            {

                pdf_0 = 0.0;

            }



            if((state_5.closure_1.transmissionWeight_0) > 0.0)
            {

                pdf_0 = pdf_0 + thinBaseProb_0 * (state_5.closure_1.transmissionWeight_0 / baseLayerWeight_0) * sampleSpecularLobePdf_0(state_5.closure_1, baseNormal_6, viewDir_27, flipAcrossNormal_0(dir_3, baseNormal_6));

            }
            else
            {

            }



            if(pdf_0 > 0.0)
            {

                thinBaseProb_0 = max(pdf_0, 0.00000999999974738);

            }
            else
            {

                thinBaseProb_0 = 0.0;

            }

            return thinBaseProb_0;
        }

        float _S82 = max(state_5.closure_1.diffuseTransmissionWeight_0 + state_5.closure_1.transmissionWeight_0, 0.00000999999974738);

        if((state_5.closure_1.diffuseTransmissionWeight_0) > 0.0)
        {

            pdf_0 = state_5.closure_1.diffuseTransmissionWeight_0 / _S82 * pdfDiffuseTransmission_0(baseNormal_6, dir_3);

        }
        else
        {

            pdf_0 = 0.0;

        }


        if((state_5.closure_1.transmissionWeight_0) > 0.0)
        {

            pdf_0 = pdf_0 + state_5.closure_1.transmissionWeight_0 / _S82 * pdfDielectricTransmission_0(state_5.closure_1, state_5.currentMediumIor_0, baseNormal_6, viewDir_27, dir_3);

        }
        else
        {

        }



        if(pdf_0 > 0.0)
        {

            thinBaseProb_0 = max(pdf_0, 0.00000999999974738);

        }
        else
        {

            thinBaseProb_0 = 0.0;

        }

        return thinBaseProb_0;
    }

    if(_S80 <= 0.0)
    {

        return 0.0;
    }

    if(thinDielectric_0)
    {

        float baseLayerWeight_1 = transmissiveBaseLayerWeight_0(state_5.closure_1);
        float _S83 = max(thinBaseProb_0 + thinSpecularProb_0 + state_5.closure_1.clearcoatWeight_0, 0.00000999999974738);
        float diffusePdf_0 = thinBaseProb_0 * state_5.closure_1.diffuseWeight_0 / baseLayerWeight_1 / _S83 * pdfDiffuseReflection_0(baseNormal_6, dir_3);

        float sheenPdf_0 = thinBaseProb_0 * state_5.closure_1.sheenWeight_0 / baseLayerWeight_1 / _S83 * pdfSheen_0(baseNormal_6, dir_3);

        float specularPdf_0 = thinSpecularProb_0 / _S83 * pdfBaseSpecular_0(state_5.closure_1, baseNormal_6, viewDir_27, dir_3);

        float _S84 = state_5.closure_1.clearcoatWeight_0 / _S83;
        if(_S81 > 0.0)
        {

            thinBaseProb_0 = pdfClearcoat_0(state_5.closure_1, clearcoatNormal_3, viewDir_27, dir_3);

        }
        else
        {

            thinBaseProb_0 = 0.0;

        }
        return max(diffusePdf_0 + sheenPdf_0 + specularPdf_0 + _S84 * thinBaseProb_0, 0.00000999999974738);
    }

    float dielectricViewFresnel_0 = dielectricViewFresnelMax_0(state_5.closure_1, baseNormal_6, viewDir_27);
    float _S85 = 1.0 - dielectricViewFresnel_0;

    float diffuseProbWeight_0 = state_5.closure_1.diffuseWeight_0 * _S85;
    float sheenProbWeight_0 = state_5.closure_1.sheenWeight_0 * _S85;

    float specularProbWeight_0 = state_5.closure_1.specularWeight_0 + state_5.closure_1.dielectricWeight_0 * (1.0 - state_5.closure_1.transparency_1) * dielectricViewFresnel_0;
    float _S86 = max(diffuseProbWeight_0 + sheenProbWeight_0 + state_5.closure_1.diffuseTransmissionWeight_0 + specularProbWeight_0 + state_5.closure_1.transmissionWeight_0 + state_5.closure_1.clearcoatWeight_0, 0.00000999999974738);

    float diffusePdf_1 = diffuseProbWeight_0 / _S86 * pdfDiffuseReflection_0(baseNormal_6, dir_3);
    float sheenPdf_1 = sheenProbWeight_0 / _S86 * pdfSheen_0(baseNormal_6, dir_3);
    float specularPdf_1 = specularProbWeight_0 / _S86 * pdfBaseSpecular_0(state_5.closure_1, baseNormal_6, viewDir_27, dir_3);

    if((state_5.closure_1.transmissionWeight_0) > 0.0)
    {

        pdf_0 = state_5.closure_1.transmissionWeight_0 / _S86 * pdfDielectricTransmission_0(state_5.closure_1, state_5.currentMediumIor_0, baseNormal_6, viewDir_27, dir_3);

    }
    else
    {

        pdf_0 = 0.0;

    }


    float _S87 = state_5.closure_1.clearcoatWeight_0 / _S86;
    if(_S81 > 0.0)
    {

        thinBaseProb_0 = pdfClearcoat_0(state_5.closure_1, clearcoatNormal_3, viewDir_27, dir_3);

    }
    else
    {

        thinBaseProb_0 = 0.0;

    }
    return max(diffusePdf_1 + sheenPdf_1 + specularPdf_1 + pdf_0 + _S87 * thinBaseProb_0, 0.00000999999974738);
}


float pdfMaterialBsdf_0(MaterialBsdfState_0 state_6, DirectionContext_0 directions_2, NormalContext_0 normals_3)
{

    return pdfMaterialBsdfMixture_0(state_6, normals_3.baseNormal_3, normals_3.clearcoatNormal_2, directions_2.viewDir_18, directions_2.lightDir_18);
}


float pdfPbrBsdf_0(MaterialBsdfState_0 state_7, DirectionContext_0 directions_3, NormalContext_0 normals_4)
{
    return pdfMaterialBsdf_0(state_7, directions_3, normals_4);
}


void orthonormalBasis_0(vec3 n_1, out vec3 tangent_2, out vec3 bitangent_0)
{

    float _S88 = n_1.z;

    float sign_0;

    if(_S88 >= 0.0)
    {

        sign_0 = 1.0;

    }
    else
    {

        sign_0 = -1.0;

    }
    float a_0 = -1.0 / (sign_0 + _S88);
    float _S89 = n_1.x;

    float _S90 = n_1.y;

    float b_0 = _S89 * _S90 * a_0;
    tangent_2 = normalize(vec3(1.0 + sign_0 * _S89 * _S89 * a_0, sign_0 * b_0, - sign_0 * _S89));
    bitangent_0 = normalize(vec3(b_0, sign_0 + _S90 * _S90 * a_0, - _S90));
    return;
}


vec3 sampleCosineHemisphere_0(vec3 normal_25, float u0_0, float u1_0)
{

    float r_0 = sqrt(u0_0);
    float phi_0 = 6.28318548202514648 * u1_0;
    float _S91 = r_0 * cos(phi_0);

    float _S92 = r_0 * sin(phi_0);

    float _S93 = sqrt(max(0.0, 1.0 - u0_0));
    vec3 tangent_3;
    vec3 bitangent_1;
    orthonormalBasis_0(normal_25, tangent_3, bitangent_1);
    return normalize(tangent_3 * _S91 + bitangent_1 * _S92 + normal_25 * _S93);
}


struct BsdfSample_0
{
    vec3 direction_0;
    float pdf_1;
    vec3 bsdfOverPdf_0;
    float specular_2;
    float crossedBoundary_0;
    float nextMediumIor_0;
};


BsdfSample_0 sampleDiffuseReflection_0(SurfaceClosure_0 closure_35, float currentMediumIor_6, vec3 normal_26, vec3 viewDir_28, float u0_1, float u1_1)
{

    vec3 dir_4 = sampleCosineHemisphere_0(normal_26, u0_1, u1_1);
    float _S94 = max(pdfDiffuseReflection_0(normal_26, dir_4), 0.00000999999974738);
    BsdfSample_0 sample_0;
    sample_0.direction_0 = dir_4;
    sample_0.pdf_1 = _S94;
    sample_0.bsdfOverPdf_0 = evalDiffuseReflection_0(closure_35, normal_26, viewDir_28, dir_4) / _S94;
    sample_0.specular_2 = 0.0;
    sample_0.crossedBoundary_0 = 0.0;
    sample_0.nextMediumIor_0 = currentMediumIor_6;
    return sample_0;
}


BsdfSample_0 sampleSheen_0(SurfaceClosure_0 closure_36, float currentMediumIor_7, vec3 normal_27, vec3 viewDir_29, float u0_2, float u1_2)
{

    vec3 dir_5 = sampleCosineHemisphere_0(normal_27, u0_2, u1_2);
    float _S95 = max(pdfSheen_0(normal_27, dir_5), 0.00000999999974738);

    BsdfSample_0 sample_1;
    sample_1.direction_0 = dir_5;
    sample_1.pdf_1 = _S95;
    sample_1.bsdfOverPdf_0 = evalSheen_0(closure_36, normal_27, viewDir_29, dir_5) / _S95;
    sample_1.specular_2 = 0.0;
    sample_1.crossedBoundary_0 = 0.0;
    sample_1.nextMediumIor_0 = currentMediumIor_7;
    return sample_1;
}


BsdfSample_0 sampleDiffuseTransmission_0(SurfaceClosure_0 closure_37, float currentMediumIor_8, vec3 normal_28, vec3 viewDir_30, float u0_3, float u1_3)
{

    vec3 dir_6 = sampleCosineHemisphere_0(- normal_28, u0_3, u1_3);
    float _S96 = max(pdfDiffuseTransmission_0(normal_28, dir_6), 0.00000999999974738);

    bool insideMedium_3;
    if((max(currentMediumIor_8, 1.0)) > 1.00010001659393311)
    {

        insideMedium_3 = (closure_37.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_3 = false;

    }

    BsdfSample_0 sample_2;
    sample_2.direction_0 = dir_6;
    sample_2.pdf_1 = _S96;
    sample_2.bsdfOverPdf_0 = evalDiffuseTransmission_0(closure_37, normal_28, dir_6) / _S96;
    sample_2.specular_2 = 0.0;
    bool _S97 = (closure_37.thinWalled_1) < 0.5;

    float _S98;

    if(_S97)
    {

        _S98 = 1.0;

    }
    else
    {

        _S98 = 0.0;

    }

    sample_2.crossedBoundary_0 = _S98;
    if(_S97)
    {

        if(insideMedium_3)
        {

            _S98 = 1.0;

        }
        else
        {

            _S98 = closure_37.ior_2;

        }

    }
    else
    {

        _S98 = currentMediumIor_8;

    }

    sample_2.nextMediumIor_0 = _S98;
    return sample_2;
}


void anisotropicBasis_0(vec3 normal_29, vec3 tangentInput_0, out vec3 tangent_4, out vec3 bitangent_2)
{

    vec3 _S99 = normalize(tangentInput_0 - normal_29 * dot(tangentInput_0, normal_29));

    tangent_4 = _S99;
    bitangent_2 = normalize(cross(normal_29, _S99));
    return;
}


vec3 sampleGGXHalfVector_0(SurfaceClosure_0 closure_38, vec3 normal_30, float roughness_9, float u0_4, float u1_4)
{

    vec2 alpha_29 = anisotropicAlpha_0(roughness_9, closure_38.anisotropy_1);
    float phi_1 = 6.28318548202514648 * u1_4;
    float sinPhi_0 = sin(phi_1);
    float cosPhi_0 = cos(phi_1);

    float _S100 = alpha_29.x;
    float _S101 = alpha_29.y;

    float cosTheta_9 = 1.0 / sqrt(1.0 + u0_4 / max(1.0 - u0_4, 9.99999997475242708e-07) / max(cosPhi_0 * cosPhi_0 / max(_S100 * _S100, 9.999999960041972e-13) + sinPhi_0 * sinPhi_0 / max(_S101 * _S101, 9.999999960041972e-13), 9.99999997475242708e-07));
    float sinTheta_0 = sqrt(max(0.0, 1.0 - cosTheta_9 * cosTheta_9));
    float _S102 = sinTheta_0 * cosPhi_0;

    float _S103 = sinTheta_0 * sinPhi_0;
    vec3 tangent_5;
    vec3 bitangent_3;
    anisotropicBasis_0(normal_30, closure_38.anisotropyTangent_1, tangent_5, bitangent_3);
    return normalize(tangent_5 * _S102 + bitangent_3 * _S103 + normal_30 * cosTheta_9);
}

float sampleHalfVectorPdf_0(SurfaceClosure_0 closure_39, vec3 normal_31, vec3 halfVec_6)
{

    vec3 localHalf_4 = projectToAnisotropicFrame_0(normal_31, closure_39.anisotropyTangent_1, halfVec_6);
    float noH_3 = abs(localHalf_4.z);
    if(noH_3 <= 0.00000999999974738)
    {

        return 0.0;
    }


    return ggxDistributionAnisotropic_0(anisotropicAlpha_0(closure_39.roughness_3, closure_39.anisotropy_1), localHalf_4) * noH_3;
}


vec3 safeRefract_0(vec3 incident_0, vec3 normal_32, float eta_1)
{

    float noI_0 = dot(normal_32, incident_0);
    float k_0 = 1.0 - eta_1 * eta_1 * (1.0 - noI_0 * noI_0);
    if(k_0 <= 0.0)
    {

        return vec3(0.0);
    }
    return eta_1 * incident_0 - (eta_1 * noI_0 + sqrt(k_0)) * normal_32;
}


BsdfSample_0 sampleDielectricTransmission_0(SurfaceClosure_0 closure_40, float currentMediumIor_9, vec3 transmissionNormal_1, vec3 normal_33, vec3 viewDir_31, float u0_5, float u1_5, float eventU_0)
{

    float _S104 = max(currentMediumIor_9, 1.0);

    bool insideMedium_4;
    if(_S104 > 1.00010001659393311)
    {

        insideMedium_4 = (closure_40.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_4 = false;

    }

    float iorI_8;
    if(insideMedium_4)
    {

        iorI_8 = _S104;

    }
    else
    {

        iorI_8 = 1.0;

    }

    float iorO_8;
    if(insideMedium_4)
    {

        iorO_8 = 1.0;

    }
    else
    {

        iorO_8 = closure_40.ior_2;

    }

    bool _S105;
    if((closure_40.thinWalled_1) < 0.5)
    {

        _S105 = (abs(iorI_8 - iorO_8)) <= 0.00009999999747379;

    }
    else
    {

        _S105 = false;

    }

    if(_S105)
    {

        BsdfSample_0 nullSample_0;
        nullSample_0.direction_0 = - viewDir_31;
        nullSample_0.pdf_1 = 1.0;
        nullSample_0.bsdfOverPdf_0 = weightedTransmissionColor_1(closure_40);
        nullSample_0.specular_2 = 2.0;
        nullSample_0.crossedBoundary_0 = 1.0;
        nullSample_0.nextMediumIor_0 = iorO_8;
        return nullSample_0;
    }
    vec3 halfVec_7 = sampleGGXHalfVector_0(closure_40, normal_33, closure_40.roughness_3, u0_5, u1_5);
    DielectricTransmissionCoefficients_0 coeffs_3 = computeDielectricTransmissionCoefficients_0(closure_40, currentMediumIor_9, normal_33, viewDir_31, iorI_8, iorO_8);
    float halfPdf_0 = sampleHalfVectorPdf_0(closure_40, normal_33, halfVec_7);
    float probReflect_0 = clamp(coeffs_3.reflectionProb_0, 0.0, 1.0);
    float _S106 = max(coeffs_3.transmissionProb_0, 0.00000999999974738);

    BsdfSample_0 sample_3;
    sample_3.crossedBoundary_0 = 0.0;
    sample_3.nextMediumIor_0 = currentMediumIor_9;
    if(eventU_0 <= probReflect_0)
    {

        vec3 dir_7 = reflect(- viewDir_31, halfVec_7);
        float lobePdf_1 = halfPdf_0 / max(4.0 * abs(dot(dir_7, halfVec_7)), 0.00000999999974738);
        sample_3.direction_0 = dir_7;
        float _S107 = max(probReflect_0 * lobePdf_1, 0.00000999999974738);

        sample_3.pdf_1 = _S107;
        sample_3.bsdfOverPdf_0 = evaluateDielectricSpecularGGX_0(closure_40, normal_33, viewDir_31, dir_7, iorI_8, iorO_8) / _S107;
        sample_3.specular_2 = 1.0;
        return sample_3;
    }
    if((closure_40.thinWalled_1) > 0.5)
    {

        vec3 dir_8 = flipAcrossNormal_0(reflect(- viewDir_31, halfVec_7), normal_33);
        float lobePdf_2 = halfPdf_0 / max(4.0 * abs(dot(dir_8, halfVec_7)), 0.00000999999974738);
        sample_3.direction_0 = dir_8;
        float _S108 = max(_S106 * lobePdf_2, 0.00000999999974738);

        sample_3.pdf_1 = _S108;
        sample_3.bsdfOverPdf_0 = evaluateThinTransmissionScattering_0(closure_40, normal_33, viewDir_31, dir_8, iorI_8, iorO_8) / _S108;
        sample_3.specular_2 = 1.0;
        return sample_3;
    }

    float sampleIorI_0;

    if(insideMedium_4)
    {

        sampleIorI_0 = closure_40.ior_2;

    }
    else
    {

        sampleIorI_0 = 1.0;

    }

    float sampleIorO_0;
    if(insideMedium_4)
    {

        sampleIorO_0 = 1.0;

    }
    else
    {

        sampleIorO_0 = closure_40.ior_2;

    }


    vec3 _S109 = - viewDir_31;

    vec3 refracted_0 = safeRefract_0(_S109, halfVec_7, sampleIorI_0 / max(sampleIorO_0, 0.00000999999974738));
    if((length(refracted_0)) <= 0.00000999999974738)
    {

        vec3 dir_9 = reflect(_S109, halfVec_7);
        float _S110 = max(pdfDielectricTransmission_0(closure_40, currentMediumIor_9, normal_33, viewDir_31, dir_9), 0.00000999999974738);
        sample_3.direction_0 = dir_9;
        sample_3.pdf_1 = _S110;
        sample_3.bsdfOverPdf_0 = evaluateDielectricSpecularGGX_0(closure_40, normal_33, viewDir_31, dir_9, iorI_8, iorO_8) / _S110;
        sample_3.specular_2 = 3.0;
        return sample_3;
    }


    float _S111 = dot(refracted_0, halfVec_7);
    float lobePdf_3 = halfPdf_0 * (sampleIorO_0 * sampleIorO_0) * abs(_S111) / max(pow(sampleIorI_0 * dot(viewDir_31, halfVec_7) + sampleIorO_0 * _S111, 2.0), 0.00000999999974738);


    float g1Light_0 = ggxSmithG1Anisotropic_0(anisotropicAlpha_0(closure_40.roughness_3, closure_40.anisotropy_1), projectToAnisotropicFrame_0(normal_33, closure_40.anisotropyTangent_1, refracted_0));

    sample_3.direction_0 = refracted_0;
    sample_3.pdf_1 = max(_S106 * lobePdf_3, 0.00000999999974738);
    sample_3.bsdfOverPdf_0 = coeffs_3.transmissionCoeff_1 / max(_S106, 0.00000999999974738) * g1Light_0;
    sample_3.specular_2 = 1.0;
    sample_3.crossedBoundary_0 = 1.0;
    if(insideMedium_4)
    {

        iorI_8 = 1.0;

    }
    else
    {

        iorI_8 = closure_40.ior_2;

    }

    sample_3.nextMediumIor_0 = iorI_8;
    return sample_3;
}


BsdfSample_0 sampleBaseSpecular_0(SurfaceClosure_0 closure_41, float currentMediumIor_10, vec3 normal_34, vec3 viewDir_32, float u0_6, float u1_6)
{

    vec3 dir_10 = reflect(- viewDir_32, sampleGGXHalfVector_0(closure_41, normal_34, closure_41.roughness_3, u0_6, u1_6));
    float _S112 = max(pdfBaseSpecular_0(closure_41, normal_34, viewDir_32, dir_10), 0.00000999999974738);

    BsdfSample_0 sample_4;
    sample_4.direction_0 = dir_10;
    sample_4.pdf_1 = _S112;
    sample_4.bsdfOverPdf_0 = evalBaseSpecular_0(closure_41, normal_34, viewDir_32, dir_10) / _S112;
    sample_4.specular_2 = 1.0;
    sample_4.crossedBoundary_0 = 0.0;
    sample_4.nextMediumIor_0 = currentMediumIor_10;
    return sample_4;
}


vec3 sampleGGXHalfVectorIsotropic_0(vec3 normal_35, float roughness_10, float u0_7, float u1_7)
{

    float _S113 = max(roughness_10 * roughness_10, 0.0);

    float phi_2 = 6.28318548202514648 * u1_7;
    float cosTheta_10 = sqrt((1.0 - u0_7) / max(1.0 + (_S113 * _S113 - 1.0) * u0_7, 9.99999997475242708e-07));
    float sinTheta_1 = sqrt(max(0.0, 1.0 - cosTheta_10 * cosTheta_10));
    float _S114 = sinTheta_1 * cos(phi_2);

    float _S115 = sinTheta_1 * sin(phi_2);
    vec3 tangent_6;
    vec3 bitangent_4;
    orthonormalBasis_0(normal_35, tangent_6, bitangent_4);
    return normalize(tangent_6 * _S114 + bitangent_4 * _S115 + normal_35 * cosTheta_10);
}


BsdfSample_0 sampleClearcoat_0(SurfaceClosure_0 closure_42, float currentMediumIor_11, vec3 normal_36, vec3 viewDir_33, float u0_8, float u1_8)
{

    vec3 dir_11 = reflect(- viewDir_33, sampleGGXHalfVectorIsotropic_0(normal_36, closure_42.clearcoatRoughness_1, u0_8, u1_8));
    float _S116 = max(pdfClearcoat_0(closure_42, normal_36, viewDir_33, dir_11), 0.00000999999974738);

    BsdfSample_0 sample_5;
    sample_5.direction_0 = dir_11;
    sample_5.pdf_1 = _S116;
    sample_5.bsdfOverPdf_0 = evalClearcoat_0(closure_42, normal_36, viewDir_33, dir_11) / _S116;
    sample_5.specular_2 = 1.0;
    sample_5.crossedBoundary_0 = 0.0;
    sample_5.nextMediumIor_0 = currentMediumIor_11;
    return sample_5;
}


BsdfSample_0 sampleMaterialBsdfMixture_0(MaterialBsdfState_0 state_8, vec3 rawGeometryNormal_1, vec3 transmissionNormal_2, vec3 baseNormal_7, vec3 clearcoatNormal_4, vec3 viewDir_34, float choiceU_0, float u0_9, float u1_9, float eventU_1)
{

    vec3 thinDir_0;

    vec3 clearcoatEval_0;



    if(isThinTransmissiveDielectric_0(state_8.closure_1))
    {

        float thinBaseProb_1 = thinInterfaceBaseProbability_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34);
        float thinSpecularProb_1 = 1.0 - thinBaseProb_1;
        float baseLayerWeight_2 = transmissiveBaseLayerWeight_0(state_8.closure_1);
        float _S117 = max(thinBaseProb_1 + thinSpecularProb_1 + state_8.closure_1.clearcoatWeight_0, 0.00000999999974738);
        float diffuseProb_0 = thinBaseProb_1 * (state_8.closure_1.diffuseWeight_0 / baseLayerWeight_2) / _S117;
        float sheenProb_0 = thinBaseProb_1 * (state_8.closure_1.sheenWeight_0 / baseLayerWeight_2) / _S117;
        float diffuseTransmissionProb_0 = thinBaseProb_1 * (state_8.closure_1.diffuseTransmissionWeight_0 / baseLayerWeight_2) / _S117;
        float thinTransmissionProb_0 = thinBaseProb_1 * (state_8.closure_1.transmissionWeight_0 / baseLayerWeight_2) / _S117;
        float specularProb_0 = thinSpecularProb_1 / _S117;

        BsdfSample_0 thinSample_0;

        thinSample_0.crossedBoundary_0 = 0.0;
        thinSample_0.nextMediumIor_0 = state_8.currentMediumIor_0;
        if(choiceU_0 < diffuseProb_0)
        {

            BsdfSample_0 diffuseSample_0 = sampleDiffuseReflection_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

            thinSample_0.specular_2 = diffuseSample_0.specular_2;

            thinDir_0 = diffuseSample_0.direction_0;

        }
        else
        {

            float _S118 = diffuseProb_0 + sheenProb_0;

            if(choiceU_0 < _S118)
            {

                BsdfSample_0 sheenSample_0 = sampleSheen_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                thinSample_0.specular_2 = sheenSample_0.specular_2;

                thinDir_0 = sheenSample_0.direction_0;

            }
            else
            {

                float _S119 = _S118 + diffuseTransmissionProb_0;

                if(choiceU_0 < _S119)
                {

                    BsdfSample_0 diffuseTransmissionSample_0 = sampleDiffuseTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                    thinSample_0.specular_2 = diffuseTransmissionSample_0.specular_2;

                    thinDir_0 = diffuseTransmissionSample_0.direction_0;

                }
                else
                {

                    float _S120 = _S119 + thinTransmissionProb_0;

                    if(choiceU_0 < _S120)
                    {

                        thinSample_0 = sampleDielectricTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, transmissionNormal_2, baseNormal_7, viewDir_34, u0_9, u1_9, 1.0);
                        float _S121 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinSample_0.direction_0);

                        thinSample_0.pdf_1 = _S121;
                        thinSample_0.bsdfOverPdf_0 = evalDielectricTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, thinSample_0.direction_0) / max(_S121, 0.00000999999974738);


                        return thinSample_0;
                    }
                    else
                    {

                        if(choiceU_0 < (_S120 + specularProb_0))
                        {

                            BsdfSample_0 specularSample_0 = sampleBaseSpecular_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                            thinSample_0.specular_2 = specularSample_0.specular_2;

                            thinDir_0 = specularSample_0.direction_0;

                        }
                        else
                        {


                            BsdfSample_0 clearcoatSample_0 = sampleClearcoat_0(state_8.closure_1, state_8.currentMediumIor_0, clearcoatNormal_4, viewDir_34, u0_9, u1_9);

                            thinSample_0.specular_2 = clearcoatSample_0.specular_2;

                            thinDir_0 = clearcoatSample_0.direction_0;

                        }

                    }

                }

            }

        }

        float _S122 = dot(baseNormal_7, thinDir_0);

        float _S123 = max(_S122, 0.0);
        float _S124 = max(dot(clearcoatNormal_4, thinDir_0), 0.0);
        bool transmissionSide_1 = _S122 < 0.0;
        if(_S123 <= 0.0)
        {

            if(transmissionSide_1)
            {

                float mixPdf_0 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
                vec3 diffuseTransmissionEval_0 = evalDiffuseTransmission_0(state_8.closure_1, baseNormal_7, thinDir_0);
                thinSample_0.direction_0 = thinDir_0;
                float _S125 = max(mixPdf_0, 0.00000999999974738);

                thinSample_0.pdf_1 = _S125;
                thinSample_0.bsdfOverPdf_0 = diffuseTransmissionEval_0 / max(_S125, 0.00000999999974738);
                thinSample_0.specular_2 = 0.0;
                return thinSample_0;
            }
            vec3 fallbackDir_0 = sampleCosineHemisphere_0(baseNormal_7, u0_9, u1_9);
            float _S126 = max(dot(baseNormal_7, fallbackDir_0), 0.0);
            thinSample_0.direction_0 = fallbackDir_0;
            thinSample_0.pdf_1 = max(_S126 * 0.31830987334251404, 0.00000999999974738);
            thinSample_0.bsdfOverPdf_0 = vec3(0.0);
            thinSample_0.specular_2 = 0.0;
            return thinSample_0;
        }

        float mixPdf_1 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
        vec3 reflectedBaseEval_0 = evaluateReflectedBaseScattering_0(state_8, baseNormal_7, viewDir_34, thinDir_0) / max(_S123, 0.00000999999974738);
        if(_S124 > 0.0)
        {

            clearcoatEval_0 = evalClearcoat_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0) / max(_S124, 0.00000999999974738);

        }
        else
        {

            clearcoatEval_0 = vec3(0.0);

        }
        float baseWeight_0 = clearcoatBaseWeight_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0);

        thinSample_0.direction_0 = thinDir_0;
        thinSample_0.pdf_1 = mixPdf_1;
        thinSample_0.bsdfOverPdf_0 = (reflectedBaseEval_0 * baseWeight_0 + clearcoatEval_0) * _S123 / max(mixPdf_1, 0.00000999999974738);
        return thinSample_0;
    }

    float dielectricViewFresnel_1 = dielectricViewFresnelMax_0(state_8.closure_1, baseNormal_7, viewDir_34);
    float _S127 = 1.0 - dielectricViewFresnel_1;

    float diffuseProbWeight_1 = state_8.closure_1.diffuseWeight_0 * _S127;
    float sheenProbWeight_1 = state_8.closure_1.sheenWeight_0 * _S127;

    float specularProbWeight_1 = state_8.closure_1.specularWeight_0 + state_8.closure_1.dielectricWeight_0 * (1.0 - state_8.closure_1.transparency_1) * dielectricViewFresnel_1;
    float baseProbWeight_0 = diffuseProbWeight_1 + sheenProbWeight_1 + state_8.closure_1.diffuseTransmissionWeight_0;
    float _S128 = max(baseProbWeight_0 + specularProbWeight_1 + state_8.closure_1.transmissionWeight_0 + state_8.closure_1.clearcoatWeight_0, 0.00000999999974738);

    float baseProb_0 = baseProbWeight_0 / _S128;
    float specularProb_1 = specularProbWeight_1 / _S128;
    float transmissionProb_1 = state_8.closure_1.transmissionWeight_0 / _S128;

    BsdfSample_0 sample_6;

    sample_6.crossedBoundary_0 = 0.0;
    sample_6.nextMediumIor_0 = state_8.currentMediumIor_0;
    if(choiceU_0 < baseProb_0)
    {

        float baseChoiceU_0 = choiceU_0 / max(baseProb_0, 0.00000999999974738);
        bool _S129 = baseProbWeight_0 > 0.0;

        float diffuseReflectProb_0;

        if(_S129)
        {

            diffuseReflectProb_0 = diffuseProbWeight_1 / baseProbWeight_0;

        }
        else
        {

            diffuseReflectProb_0 = 0.0;

        }

        float sheenReflectProb_0;
        if(_S129)
        {

            sheenReflectProb_0 = sheenProbWeight_1 / baseProbWeight_0;

        }
        else
        {

            sheenReflectProb_0 = 0.0;

        }
        if(baseChoiceU_0 < diffuseReflectProb_0)
        {

            BsdfSample_0 diffuseSample_1 = sampleDiffuseReflection_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

            sample_6.specular_2 = diffuseSample_1.specular_2;

            thinDir_0 = diffuseSample_1.direction_0;

        }
        else
        {

            if(baseChoiceU_0 < (diffuseReflectProb_0 + sheenReflectProb_0))
            {

                BsdfSample_0 sheenSample_1 = sampleSheen_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                sample_6.specular_2 = sheenSample_1.specular_2;

                thinDir_0 = sheenSample_1.direction_0;

            }
            else
            {


                BsdfSample_0 diffuseTransmissionSample_1 = sampleDiffuseTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                sample_6.specular_2 = diffuseTransmissionSample_1.specular_2;
                sample_6.crossedBoundary_0 = diffuseTransmissionSample_1.crossedBoundary_0;
                sample_6.nextMediumIor_0 = diffuseTransmissionSample_1.nextMediumIor_0;

                thinDir_0 = diffuseTransmissionSample_1.direction_0;

            }

        }

    }
    else
    {

        float _S130 = baseProb_0 + specularProb_1;

        if(choiceU_0 < _S130)
        {

            BsdfSample_0 specularSample_1 = sampleBaseSpecular_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

            sample_6.specular_2 = specularSample_1.specular_2;

            thinDir_0 = specularSample_1.direction_0;

        }
        else
        {

            BsdfSample_0 _S131;



            if(choiceU_0 < (_S130 + transmissionProb_1))
            {

                sample_6 = sampleDielectricTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, transmissionNormal_2, baseNormal_7, viewDir_34, u0_9, u1_9, eventU_1);
                sample_6.bsdfOverPdf_0 = sample_6.bsdfOverPdf_0 / max(transmissionProb_1, 0.00000999999974738);
                if((sample_6.pdf_1) < 1.0)
                {

                    sample_6.pdf_1 = sample_6.pdf_1 * transmissionProb_1;

                }


                return sample_6;
            }
            else
            {

                BsdfSample_0 clearcoatSample_1 = sampleClearcoat_0(state_8.closure_1, state_8.currentMediumIor_0, clearcoatNormal_4, viewDir_34, u0_9, u1_9);

                _S131 = clearcoatSample_1;

                sample_6.specular_2 = clearcoatSample_1.specular_2;

            }

            thinDir_0 = _S131.direction_0;

        }

    }

    float _S132 = dot(baseNormal_7, thinDir_0);

    float _S133 = max(_S132, 0.0);
    float _S134 = max(dot(clearcoatNormal_4, thinDir_0), 0.0);
    bool transmissionSide_2 = _S132 < 0.0;
    float absNoL_0 = abs(_S132);
    if(_S133 <= 0.0)
    {

        if(transmissionSide_2)
        {

            float mixPdf_2 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
            vec3 diffuseTransmissionEval_1 = evalDiffuseTransmission_0(state_8.closure_1, baseNormal_7, thinDir_0);
            sample_6.direction_0 = thinDir_0;
            float _S135 = max(mixPdf_2, 0.00000999999974738);

            sample_6.pdf_1 = _S135;
            sample_6.bsdfOverPdf_0 = diffuseTransmissionEval_1 / _S135;
            sample_6.specular_2 = 0.0;
            return sample_6;
        }
        vec3 fallbackDir_1 = sampleCosineHemisphere_0(baseNormal_7, u0_9, u1_9);
        float _S136 = max(dot(baseNormal_7, fallbackDir_1), 0.0);
        sample_6.direction_0 = fallbackDir_1;
        sample_6.pdf_1 = max(_S136 * 0.31830987334251404, 0.00000999999974738);
        sample_6.bsdfOverPdf_0 = vec3(0.0);
        sample_6.specular_2 = 0.0;
        sample_6.nextMediumIor_0 = state_8.currentMediumIor_0;
        return sample_6;
    }

    float mixPdf_3 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
    vec3 reflectedBaseEval_1 = evaluateReflectedBaseScattering_0(state_8, baseNormal_7, viewDir_34, thinDir_0) / max(_S133, 0.00000999999974738);
    if(_S134 > 0.0)
    {

        clearcoatEval_0 = evalClearcoat_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0) / max(_S134, 0.00000999999974738);

    }
    else
    {

        clearcoatEval_0 = vec3(0.0);

    }
    float baseWeight_1 = clearcoatBaseWeight_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0);

    sample_6.direction_0 = thinDir_0;
    sample_6.pdf_1 = mixPdf_3;
    sample_6.bsdfOverPdf_0 = (reflectedBaseEval_1 * baseWeight_1 + clearcoatEval_0) * absNoL_0 / mixPdf_3;
    sample_6.nextMediumIor_0 = state_8.currentMediumIor_0;
    return sample_6;
}


struct SampleRandoms_0
{
    float component_0;
    vec2 lobe_0;
    float boundary_0;
};


BsdfSample_0 sampleMaterialBsdf_0(MaterialBsdfState_0 state_9, DirectionContext_0 directions_4, NormalContext_0 normals_5, SampleRandoms_0 randoms_0)
{



    return sampleMaterialBsdfMixture_0(state_9, normals_5.rawGeometryNormal_0, normals_5.transmissionNormal_0, normals_5.baseNormal_3, normals_5.clearcoatNormal_2, directions_4.viewDir_18, randoms_0.component_0, randoms_0.lobe_0.x, randoms_0.lobe_0.y, randoms_0.boundary_0);
}


BsdfSample_0 samplePbrBsdf_0(MaterialBsdfState_0 state_10, DirectionContext_0 directions_5, NormalContext_0 normals_6, SampleRandoms_0 randoms_1)
{

    return sampleMaterialBsdf_0(state_10, directions_5, normals_6, randoms_1);
}


vec3 multiscatterToSingleScatterAlbedo_0(vec3 multiscatterColor_2, float scatterAnisotropy_3)
{
    return multiscatterColor_2 * 0.0 + vec3(scatterAnisotropy_3 * 0.0);
}


struct MaterialVolumeState_0
{
    vec3 sigmaT_0;
    float isActive_0;
    vec3 rhoSs_0;
    float scatterAnisotropy_4;
    vec3 sigmaA_0;
    float _pad0_1;
};


MaterialVolumeState_0 buildVolumeCoefficients_0(SurfaceClosure_0 closure_43)
{

    MaterialVolumeState_0 volume_0;

    volume_0.sigmaT_0 = - log(max(closure_43.attenuationColor_2, vec3(0.00009999999747379))) / max(closure_43.attenuationDistance_2, 0.00009999999747379);

    float _S137;
    if((closure_43.thinWalled_1) < 0.5)
    {

        _S137 = 1.0;

    }
    else
    {

        _S137 = 0.0;

    }

    volume_0.isActive_0 = _S137;

    volume_0.scatterAnisotropy_4 = 0.0;


    vec3 _S138 = multiscatterToSingleScatterAlbedo_0(closure_43.multiscatterColor_1, 0.0);

    volume_0.rhoSs_0 = _S138;
    volume_0.sigmaA_0 = max(volume_0.sigmaT_0 * (vec3(1.0) - _S138), vec3(0.0));
    volume_0._pad0_1 = 0.0;
    return volume_0;
}


MaterialVolumeState_0 prepareMaterialVolumeState_0(MaterialBsdfState_0 bsdfState_0)
{

    return buildVolumeCoefficients_0(bsdfState_0.closure_1);
}


MaterialVolumeState_0 preparePbrVolumeState_0(MaterialBsdfState_0 state_11)
{
    return prepareMaterialVolumeState_0(state_11);
}


vec3 evalHomogeneousTransmittance_0(MaterialVolumeState_0 volume_1, float distance_0)
{


    return exp(- max(volume_1.sigmaT_0, vec3(0.0)) * max(distance_0, 0.0));
}


vec3 evalPbrHomogeneousTransmittance_0(MaterialVolumeState_0 volume_2, float distance_1)
{

    return evalHomogeneousTransmittance_0(volume_2, distance_1);
}


float homogeneousMediumEventPdf_0(MaterialVolumeState_0 volume_3, float distance_2)
{
    return 0.00000999999974738;
}


float pbrHomogeneousMediumEventPdf_0(MaterialVolumeState_0 volume_4, float distance_3)
{

    return homogeneousMediumEventPdf_0(volume_4, distance_3);
}


float homogeneousMediumNoEventPdf_0(MaterialVolumeState_0 volume_5, float distance_4)
{

    vec3 tr_0 = evalHomogeneousTransmittance_0(volume_5, distance_4);
    return max((tr_0.x + tr_0.y + tr_0.z) / 3.0, 0.00000999999974738);
}


float pbrHomogeneousMediumNoEventPdf_0(MaterialVolumeState_0 volume_6, float distance_5)
{

    return homogeneousMediumNoEventPdf_0(volume_6, distance_5);
}


MaterialVolumeState_0 clearMaterialVolumeState_0()
{

    MaterialVolumeState_0 volume_7;
    const vec3 _S139 = vec3(0.0);

    volume_7.sigmaT_0 = _S139;
    volume_7.rhoSs_0 = _S139;
    volume_7.sigmaA_0 = _S139;
    volume_7.scatterAnisotropy_4 = 0.0;
    volume_7._pad0_1 = 0.0;
    volume_7.isActive_0 = 0.0;
    return volume_7;
}


MaterialVolumeState_0 clearPbrVolumeState_0()
{

    return clearMaterialVolumeState_0();
}


MaterialVolumeState_0 enterMaterialVolumeState_0(MaterialVolumeState_0 volume_8)
{

    MaterialVolumeState_0 entered_0 = volume_8;

    float _S140;
    if((volume_8.isActive_0) > 0.5)
    {

        _S140 = 1.0;

    }
    else
    {

        _S140 = 0.0;

    }

    entered_0.isActive_0 = _S140;
    return entered_0;
}


MaterialVolumeState_0 enterPbrVolumeState_0(MaterialVolumeState_0 volume_9)
{

    return enterMaterialVolumeState_0(volume_9);
}


float evalVolumePhase_0(MaterialVolumeState_0 volume_10, vec3 incidentDir_0, vec3 outgoingDir_0)
{
    return 0.0;
}



float pdfVolumePhase_0(MaterialVolumeState_0 volume_11, vec3 incidentDir_1, vec3 outgoingDir_1)
{

    return evalVolumePhase_0(volume_11, incidentDir_1, outgoingDir_1);
}


struct VolumePhaseSample_0
{
    vec3 direction_1;
    float pdf_2;
};


VolumePhaseSample_0 sampleVolumePhase_0(MaterialVolumeState_0 volume_12, vec3 incidentDir_2, vec2 randoms_2)
{
    VolumePhaseSample_0 disabledSample_0;
    disabledSample_0.direction_1 = incidentDir_2;
    disabledSample_0.pdf_2 = 0.0;
    return disabledSample_0;
}


VolumePhaseSample_0 samplePbrVolumePhase_0(MaterialVolumeState_0 volume_13, vec3 incidentDir_3, vec2 randoms_3)
{

    return sampleVolumePhase_0(volume_13, incidentDir_3, randoms_3);
}


float evalPbrVolumePhase_0(MaterialVolumeState_0 volume_14, vec3 incidentDir_4, vec3 outgoingDir_2)
{

    return evalVolumePhase_0(volume_14, incidentDir_4, outgoingDir_2);
}

float pdfPbrVolumePhase_0(MaterialVolumeState_0 volume_15, vec3 incidentDir_5, vec3 outgoingDir_3)
{

    return pdfVolumePhase_0(volume_15, incidentDir_5, outgoingDir_3);
}

// Stable adapter-facing facade. Code outside this generated file should use

// Pbr* names only; generated Slang backend names stay private here.



struct PbrGltfMaterial
{
    vec4 baseColorFactor;
    float metallicFactor;
    float roughnessFactor;
    vec3 emissiveFactor;
    float emissiveStrength;
    float specularFactor;
    vec3 specularColorFactor;
    float transmissionFactor;
    float diffuseTransmissionFactor;
    vec3 diffuseTransmissionColorFactor;
    float ior;
    vec3 attenuationColor;
    float attenuationDistance;
    float thicknessFactor;
    vec3 multiscatterColorFactor;
    float scatterAnisotropy;
    float clearcoatFactor;
    float clearcoatRoughnessFactor;
    float clearcoatNormalTextureScale;
    vec3 sheenColorFactor;
    float sheenRoughnessFactor;
    float anisotropyStrength;
    float anisotropyRotation;
    float iridescenceFactor;
    float iridescenceIor;
    float iridescenceThickness;
    float dispersion;
    float normalTextureScale;
    uint featureMask;
};

struct PbrMaterial
{
    vec3 albedo;
    float metallic;
    float roughness;
    float anisotropy;
    vec3 anisotropyDirection;
    float transparency;
    float ior;
    vec3 specularColor;
    float specular;
    vec3 emission;
    float normalScale;
    vec3 attenuationColor;
    float attenuationDistance;
    vec3 multiscatterColor;
    float scatterAnisotropy;
    float thinWalled;
    float translucency;
    vec3 translucencyColor;
    float iridescence;
    float iridescenceIor;
    float iridescenceThickness;
    float dispersion;
    float clearcoat;
    float clearcoatRoughness;
    vec3 sheenColor;
    float sheenRoughness;
    float clearcoatNormalScale;
    float frontFaceEmissionOnly;
};

struct PbrLayerNormals
{
    vec3 rawGeometry;
    vec3 geometry;
    vec3 shadingGeometry;
    vec3 interfaceBase;
    vec3 base;
    vec3 clearcoat;
    vec3 anisotropyTangent;
};

struct PbrClosure
{
    vec3 diffuseColor;
    vec3 diffuseReflectionColor;
    vec3 transmissionColor;
    float diffuseWeight;
    float sheenWeight;
    float anisotropy;
    vec3 anisotropyTangent;
    vec3 specularColor;
    vec3 specularF90;
    vec3 dielectricSpecularColor;
    vec3 dielectricSpecularF90;
    float dielectricWeight;
    float specularWeight;
    float clearcoatWeight;
    float roughness;
    vec3 sheenColor;
    float sheenRoughness;
    float transparency;
    float clearcoat;
    float clearcoatRoughness;
    vec3 throughput;
    float metallic;
    float specular;
    float ior;
    float iridescence;
    float iridescenceIor;
    float iridescenceThickness;
    float dispersion;
    float thinWalled;
    vec3 attenuationColor;
    float attenuationDistance;
    vec3 multiscatterColor;
    float scatterAnisotropy;
    float transmissionWeight;
    vec3 diffuseTransmissionColor;
    float diffuseTransmissionWeight;
};

struct PbrTransport
{
    float currentMediumIor;
    float interfaceIor;
    float thinWalled;
    float _pad0;
};

struct PbrDirections
{
    vec3 viewDir;
    vec3 lightDir;
};

struct PbrNormals
{
    vec3 rawGeometryNormal;
    vec3 transmissionNormal;
    vec3 baseNormal;
    vec3 clearcoatNormal;
};

struct PbrRandoms
{
    float component;
    vec2 lobe;
    float boundary;
};

struct PbrSample
{
    vec3 direction;
    float pdf;
    vec3 bsdfOverPdf;
    float specular;
    float crossedBoundary;
    float nextMediumIor;
};

struct PbrVolume
{
    vec3 sigmaT;
    float isActive;
    vec3 rhoSs;
    float scatterAnisotropy;
    vec3 sigmaA;
    float _pad0;
};

struct PbrPhaseSample
{
    vec3 direction;
    float pdf;
};

struct PbrState
{
    PbrMaterial surface;
    PbrClosure closure;
    float currentMediumIor;
};

struct PbrGltfState
{
    PbrGltfMaterial material;
    PbrClosure closure;
    float currentMediumIor;
};

GltfPbrMaterial_0 pbrToGeneratedGltfPbrMaterial(PbrGltfMaterial stable)
{
    GltfPbrMaterial_0 generated;
    generated.baseColorFactor_0 = stable.baseColorFactor;
    generated.metallicFactor_0 = stable.metallicFactor;
    generated.roughnessFactor_0 = stable.roughnessFactor;
    generated.emissiveFactor_0 = stable.emissiveFactor;
    generated.emissiveStrength_0 = stable.emissiveStrength;
    generated.specularFactor_0 = stable.specularFactor;
    generated.specularColorFactor_0 = stable.specularColorFactor;
    generated.transmissionFactor_0 = stable.transmissionFactor;
    generated.diffuseTransmissionFactor_0 = stable.diffuseTransmissionFactor;
    generated.diffuseTransmissionColorFactor_0 = stable.diffuseTransmissionColorFactor;
    generated.ior_0 = stable.ior;
    generated.attenuationColor_0 = stable.attenuationColor;
    generated.attenuationDistance_0 = stable.attenuationDistance;
    generated.thicknessFactor_0 = stable.thicknessFactor;
    generated.multiscatterColorFactor_0 = stable.multiscatterColorFactor;
    generated.scatterAnisotropy_0 = stable.scatterAnisotropy;
    generated.clearcoatFactor_0 = stable.clearcoatFactor;
    generated.clearcoatRoughnessFactor_0 = stable.clearcoatRoughnessFactor;
    generated.clearcoatNormalTextureScale_0 = stable.clearcoatNormalTextureScale;
    generated.sheenColorFactor_0 = stable.sheenColorFactor;
    generated.sheenRoughnessFactor_0 = stable.sheenRoughnessFactor;
    generated.anisotropyStrength_0 = stable.anisotropyStrength;
    generated.anisotropyRotation_0 = stable.anisotropyRotation;
    generated.iridescenceFactor_0 = stable.iridescenceFactor;
    generated.iridescenceIor_0 = stable.iridescenceIor;
    generated.iridescenceThickness_0 = stable.iridescenceThickness;
    generated.dispersion_0 = stable.dispersion;
    generated.normalTextureScale_0 = stable.normalTextureScale;
    generated.featureMask_0 = stable.featureMask;
    return generated;
}

PbrGltfMaterial pbrFromGeneratedGltfPbrMaterial(GltfPbrMaterial_0 generated)
{
    PbrGltfMaterial stable;
    stable.baseColorFactor = generated.baseColorFactor_0;
    stable.metallicFactor = generated.metallicFactor_0;
    stable.roughnessFactor = generated.roughnessFactor_0;
    stable.emissiveFactor = generated.emissiveFactor_0;
    stable.emissiveStrength = generated.emissiveStrength_0;
    stable.specularFactor = generated.specularFactor_0;
    stable.specularColorFactor = generated.specularColorFactor_0;
    stable.transmissionFactor = generated.transmissionFactor_0;
    stable.diffuseTransmissionFactor = generated.diffuseTransmissionFactor_0;
    stable.diffuseTransmissionColorFactor = generated.diffuseTransmissionColorFactor_0;
    stable.ior = generated.ior_0;
    stable.attenuationColor = generated.attenuationColor_0;
    stable.attenuationDistance = generated.attenuationDistance_0;
    stable.thicknessFactor = generated.thicknessFactor_0;
    stable.multiscatterColorFactor = generated.multiscatterColorFactor_0;
    stable.scatterAnisotropy = generated.scatterAnisotropy_0;
    stable.clearcoatFactor = generated.clearcoatFactor_0;
    stable.clearcoatRoughnessFactor = generated.clearcoatRoughnessFactor_0;
    stable.clearcoatNormalTextureScale = generated.clearcoatNormalTextureScale_0;
    stable.sheenColorFactor = generated.sheenColorFactor_0;
    stable.sheenRoughnessFactor = generated.sheenRoughnessFactor_0;
    stable.anisotropyStrength = generated.anisotropyStrength_0;
    stable.anisotropyRotation = generated.anisotropyRotation_0;
    stable.iridescenceFactor = generated.iridescenceFactor_0;
    stable.iridescenceIor = generated.iridescenceIor_0;
    stable.iridescenceThickness = generated.iridescenceThickness_0;
    stable.dispersion = generated.dispersion_0;
    stable.normalTextureScale = generated.normalTextureScale_0;
    stable.featureMask = generated.featureMask_0;
    return stable;
}

SurfaceMaterial_0 pbrToGeneratedSurfaceMaterial(PbrMaterial stable)
{
    SurfaceMaterial_0 generated;
    generated.albedo_0 = stable.albedo;
    generated.metallic_0 = stable.metallic;
    generated.roughness_1 = stable.roughness;
    generated.anisotropy_0 = stable.anisotropy;
    generated.anisotropyDirection_0 = stable.anisotropyDirection;
    generated.transparency_0 = stable.transparency;
    generated.ior_1 = stable.ior;
    generated.specularColor_0 = stable.specularColor;
    generated.specular_0 = stable.specular;
    generated.emission_0 = stable.emission;
    generated.normalScale_0 = stable.normalScale;
    generated.attenuationColor_1 = stable.attenuationColor;
    generated.attenuationDistance_1 = stable.attenuationDistance;
    generated.multiscatterColor_0 = stable.multiscatterColor;
    generated.scatterAnisotropy_1 = stable.scatterAnisotropy;
    generated.thinWalled_0 = stable.thinWalled;
    generated.translucency_0 = stable.translucency;
    generated.translucencyColor_0 = stable.translucencyColor;
    generated.iridescence_0 = stable.iridescence;
    generated.iridescenceIor_1 = stable.iridescenceIor;
    generated.iridescenceThickness_1 = stable.iridescenceThickness;
    generated.dispersion_1 = stable.dispersion;
    generated.clearcoat_0 = stable.clearcoat;
    generated.clearcoatRoughness_0 = stable.clearcoatRoughness;
    generated.sheenColor_0 = stable.sheenColor;
    generated.sheenRoughness_0 = stable.sheenRoughness;
    generated.clearcoatNormalScale_0 = stable.clearcoatNormalScale;
    generated.frontFaceEmissionOnly_0 = stable.frontFaceEmissionOnly;
    return generated;
}

PbrMaterial pbrFromGeneratedSurfaceMaterial(SurfaceMaterial_0 generated)
{
    PbrMaterial stable;
    stable.albedo = generated.albedo_0;
    stable.metallic = generated.metallic_0;
    stable.roughness = generated.roughness_1;
    stable.anisotropy = generated.anisotropy_0;
    stable.anisotropyDirection = generated.anisotropyDirection_0;
    stable.transparency = generated.transparency_0;
    stable.ior = generated.ior_1;
    stable.specularColor = generated.specularColor_0;
    stable.specular = generated.specular_0;
    stable.emission = generated.emission_0;
    stable.normalScale = generated.normalScale_0;
    stable.attenuationColor = generated.attenuationColor_1;
    stable.attenuationDistance = generated.attenuationDistance_1;
    stable.multiscatterColor = generated.multiscatterColor_0;
    stable.scatterAnisotropy = generated.scatterAnisotropy_1;
    stable.thinWalled = generated.thinWalled_0;
    stable.translucency = generated.translucency_0;
    stable.translucencyColor = generated.translucencyColor_0;
    stable.iridescence = generated.iridescence_0;
    stable.iridescenceIor = generated.iridescenceIor_1;
    stable.iridescenceThickness = generated.iridescenceThickness_1;
    stable.dispersion = generated.dispersion_1;
    stable.clearcoat = generated.clearcoat_0;
    stable.clearcoatRoughness = generated.clearcoatRoughness_0;
    stable.sheenColor = generated.sheenColor_0;
    stable.sheenRoughness = generated.sheenRoughness_0;
    stable.clearcoatNormalScale = generated.clearcoatNormalScale_0;
    stable.frontFaceEmissionOnly = generated.frontFaceEmissionOnly_0;
    return stable;
}

SurfaceLayerNormals_0 pbrToGeneratedSurfaceLayerNormals(PbrLayerNormals stable)
{
    SurfaceLayerNormals_0 generated;
    generated.rawGeometry_0 = stable.rawGeometry;
    generated.geometry_0 = stable.geometry;
    generated.shadingGeometry_0 = stable.shadingGeometry;
    generated.interfaceBase_0 = stable.interfaceBase;
    generated.base_0 = stable.base;
    generated.clearcoat_1 = stable.clearcoat;
    generated.anisotropyTangent_0 = stable.anisotropyTangent;
    return generated;
}

PbrLayerNormals pbrFromGeneratedSurfaceLayerNormals(SurfaceLayerNormals_0 generated)
{
    PbrLayerNormals stable;
    stable.rawGeometry = generated.rawGeometry_0;
    stable.geometry = generated.geometry_0;
    stable.shadingGeometry = generated.shadingGeometry_0;
    stable.interfaceBase = generated.interfaceBase_0;
    stable.base = generated.base_0;
    stable.clearcoat = generated.clearcoat_1;
    stable.anisotropyTangent = generated.anisotropyTangent_0;
    return stable;
}

SurfaceClosure_0 pbrToGeneratedSurfaceClosure(PbrClosure stable)
{
    SurfaceClosure_0 generated;
    generated.diffuseColor_0 = stable.diffuseColor;
    generated.diffuseReflectionColor_0 = stable.diffuseReflectionColor;
    generated.transmissionColor_0 = stable.transmissionColor;
    generated.diffuseWeight_0 = stable.diffuseWeight;
    generated.sheenWeight_0 = stable.sheenWeight;
    generated.anisotropy_1 = stable.anisotropy;
    generated.anisotropyTangent_1 = stable.anisotropyTangent;
    generated.specularColor_1 = stable.specularColor;
    generated.specularF90_0 = stable.specularF90;
    generated.dielectricSpecularColor_0 = stable.dielectricSpecularColor;
    generated.dielectricSpecularF90_0 = stable.dielectricSpecularF90;
    generated.dielectricWeight_0 = stable.dielectricWeight;
    generated.specularWeight_0 = stable.specularWeight;
    generated.clearcoatWeight_0 = stable.clearcoatWeight;
    generated.roughness_3 = stable.roughness;
    generated.sheenColor_1 = stable.sheenColor;
    generated.sheenRoughness_1 = stable.sheenRoughness;
    generated.transparency_1 = stable.transparency;
    generated.clearcoat_2 = stable.clearcoat;
    generated.clearcoatRoughness_1 = stable.clearcoatRoughness;
    generated.throughput_0 = stable.throughput;
    generated.metallic_1 = stable.metallic;
    generated.specular_1 = stable.specular;
    generated.ior_2 = stable.ior;
    generated.iridescence_2 = stable.iridescence;
    generated.iridescenceIor_2 = stable.iridescenceIor;
    generated.iridescenceThickness_2 = stable.iridescenceThickness;
    generated.dispersion_2 = stable.dispersion;
    generated.thinWalled_1 = stable.thinWalled;
    generated.attenuationColor_2 = stable.attenuationColor;
    generated.attenuationDistance_2 = stable.attenuationDistance;
    generated.multiscatterColor_1 = stable.multiscatterColor;
    generated.scatterAnisotropy_2 = stable.scatterAnisotropy;
    generated.transmissionWeight_0 = stable.transmissionWeight;
    generated.diffuseTransmissionColor_0 = stable.diffuseTransmissionColor;
    generated.diffuseTransmissionWeight_0 = stable.diffuseTransmissionWeight;
    return generated;
}

PbrClosure pbrFromGeneratedSurfaceClosure(SurfaceClosure_0 generated)
{
    PbrClosure stable;
    stable.diffuseColor = generated.diffuseColor_0;
    stable.diffuseReflectionColor = generated.diffuseReflectionColor_0;
    stable.transmissionColor = generated.transmissionColor_0;
    stable.diffuseWeight = generated.diffuseWeight_0;
    stable.sheenWeight = generated.sheenWeight_0;
    stable.anisotropy = generated.anisotropy_1;
    stable.anisotropyTangent = generated.anisotropyTangent_1;
    stable.specularColor = generated.specularColor_1;
    stable.specularF90 = generated.specularF90_0;
    stable.dielectricSpecularColor = generated.dielectricSpecularColor_0;
    stable.dielectricSpecularF90 = generated.dielectricSpecularF90_0;
    stable.dielectricWeight = generated.dielectricWeight_0;
    stable.specularWeight = generated.specularWeight_0;
    stable.clearcoatWeight = generated.clearcoatWeight_0;
    stable.roughness = generated.roughness_3;
    stable.sheenColor = generated.sheenColor_1;
    stable.sheenRoughness = generated.sheenRoughness_1;
    stable.transparency = generated.transparency_1;
    stable.clearcoat = generated.clearcoat_2;
    stable.clearcoatRoughness = generated.clearcoatRoughness_1;
    stable.throughput = generated.throughput_0;
    stable.metallic = generated.metallic_1;
    stable.specular = generated.specular_1;
    stable.ior = generated.ior_2;
    stable.iridescence = generated.iridescence_2;
    stable.iridescenceIor = generated.iridescenceIor_2;
    stable.iridescenceThickness = generated.iridescenceThickness_2;
    stable.dispersion = generated.dispersion_2;
    stable.thinWalled = generated.thinWalled_1;
    stable.attenuationColor = generated.attenuationColor_2;
    stable.attenuationDistance = generated.attenuationDistance_2;
    stable.multiscatterColor = generated.multiscatterColor_1;
    stable.scatterAnisotropy = generated.scatterAnisotropy_2;
    stable.transmissionWeight = generated.transmissionWeight_0;
    stable.diffuseTransmissionColor = generated.diffuseTransmissionColor_0;
    stable.diffuseTransmissionWeight = generated.diffuseTransmissionWeight_0;
    return stable;
}

TransportContext_0 pbrToGeneratedTransportContext(PbrTransport stable)
{
    TransportContext_0 generated;
    generated.currentMediumIor_1 = stable.currentMediumIor;
    generated.interfaceIor_0 = stable.interfaceIor;
    generated.thinWalled_2 = stable.thinWalled;
    generated._pad0_0 = stable._pad0;
    return generated;
}

PbrTransport pbrFromGeneratedTransportContext(TransportContext_0 generated)
{
    PbrTransport stable;
    stable.currentMediumIor = generated.currentMediumIor_1;
    stable.interfaceIor = generated.interfaceIor_0;
    stable.thinWalled = generated.thinWalled_2;
    stable._pad0 = generated._pad0_0;
    return stable;
}

DirectionContext_0 pbrToGeneratedDirectionContext(PbrDirections stable)
{
    DirectionContext_0 generated;
    generated.viewDir_18 = stable.viewDir;
    generated.lightDir_18 = stable.lightDir;
    return generated;
}

PbrDirections pbrFromGeneratedDirectionContext(DirectionContext_0 generated)
{
    PbrDirections stable;
    stable.viewDir = generated.viewDir_18;
    stable.lightDir = generated.lightDir_18;
    return stable;
}

NormalContext_0 pbrToGeneratedNormalContext(PbrNormals stable)
{
    NormalContext_0 generated;
    generated.rawGeometryNormal_0 = stable.rawGeometryNormal;
    generated.transmissionNormal_0 = stable.transmissionNormal;
    generated.baseNormal_3 = stable.baseNormal;
    generated.clearcoatNormal_2 = stable.clearcoatNormal;
    return generated;
}

PbrNormals pbrFromGeneratedNormalContext(NormalContext_0 generated)
{
    PbrNormals stable;
    stable.rawGeometryNormal = generated.rawGeometryNormal_0;
    stable.transmissionNormal = generated.transmissionNormal_0;
    stable.baseNormal = generated.baseNormal_3;
    stable.clearcoatNormal = generated.clearcoatNormal_2;
    return stable;
}

SampleRandoms_0 pbrToGeneratedSampleRandoms(PbrRandoms stable)
{
    SampleRandoms_0 generated;
    generated.component_0 = stable.component;
    generated.lobe_0 = stable.lobe;
    generated.boundary_0 = stable.boundary;
    return generated;
}

PbrRandoms pbrFromGeneratedSampleRandoms(SampleRandoms_0 generated)
{
    PbrRandoms stable;
    stable.component = generated.component_0;
    stable.lobe = generated.lobe_0;
    stable.boundary = generated.boundary_0;
    return stable;
}

BsdfSample_0 pbrToGeneratedBsdfSample(PbrSample stable)
{
    BsdfSample_0 generated;
    generated.direction_0 = stable.direction;
    generated.pdf_1 = stable.pdf;
    generated.bsdfOverPdf_0 = stable.bsdfOverPdf;
    generated.specular_2 = stable.specular;
    generated.crossedBoundary_0 = stable.crossedBoundary;
    generated.nextMediumIor_0 = stable.nextMediumIor;
    return generated;
}

PbrSample pbrFromGeneratedBsdfSample(BsdfSample_0 generated)
{
    PbrSample stable;
    stable.direction = generated.direction_0;
    stable.pdf = generated.pdf_1;
    stable.bsdfOverPdf = generated.bsdfOverPdf_0;
    stable.specular = generated.specular_2;
    stable.crossedBoundary = generated.crossedBoundary_0;
    stable.nextMediumIor = generated.nextMediumIor_0;
    return stable;
}

MaterialVolumeState_0 pbrToGeneratedMaterialVolumeState(PbrVolume stable)
{
    MaterialVolumeState_0 generated;
    generated.sigmaT_0 = stable.sigmaT;
    generated.isActive_0 = stable.isActive;
    generated.rhoSs_0 = stable.rhoSs;
    generated.scatterAnisotropy_4 = stable.scatterAnisotropy;
    generated.sigmaA_0 = stable.sigmaA;
    generated._pad0_1 = stable._pad0;
    return generated;
}

PbrVolume pbrFromGeneratedMaterialVolumeState(MaterialVolumeState_0 generated)
{
    PbrVolume stable;
    stable.sigmaT = generated.sigmaT_0;
    stable.isActive = generated.isActive_0;
    stable.rhoSs = generated.rhoSs_0;
    stable.scatterAnisotropy = generated.scatterAnisotropy_4;
    stable.sigmaA = generated.sigmaA_0;
    stable._pad0 = generated._pad0_1;
    return stable;
}

VolumePhaseSample_0 pbrToGeneratedVolumePhaseSample(PbrPhaseSample stable)
{
    VolumePhaseSample_0 generated;
    generated.direction_1 = stable.direction;
    generated.pdf_2 = stable.pdf;
    return generated;
}

PbrPhaseSample pbrFromGeneratedVolumePhaseSample(VolumePhaseSample_0 generated)
{
    PbrPhaseSample stable;
    stable.direction = generated.direction_1;
    stable.pdf = generated.pdf_2;
    return stable;
}

MaterialBsdfState_0 pbrToGeneratedMaterialBsdfState(PbrState stable)
{
    MaterialBsdfState_0 generated;
    generated.closure_1 = pbrToGeneratedSurfaceClosure(stable.closure);
    generated.currentMediumIor_0 = stable.currentMediumIor;
    return generated;
}

PbrClosure pbrBuildClosureFromGltf(PbrGltfMaterial material, PbrLayerNormals layerNormals, vec3 anisotropyTangent)
{
    return pbrFromGeneratedSurfaceClosure(buildPbrSurfaceClosure_0(buildPbrSurfaceFromGltf_0(pbrToGeneratedGltfPbrMaterial(material)), pbrToGeneratedSurfaceLayerNormals(layerNormals), anisotropyTangent));
}

MaterialBsdfState_0 pbrToGeneratedGltfMaterialBsdfState(PbrGltfState stable)
{
    MaterialBsdfState_0 generated;
    generated.closure_1 = pbrToGeneratedSurfaceClosure(stable.closure);
    generated.currentMediumIor_0 = stable.currentMediumIor;
    return generated;
}

PbrGltfState pbrPrepareStateFromGltf(PbrGltfMaterial material, PbrClosure closure, PbrTransport transport)
{
    PbrGltfState stable;
    stable.material = material;
    stable.closure = closure;
    stable.currentMediumIor = max(transport.currentMediumIor, 1.0);
    return stable;
}

vec3 pbrEvalGltfState(PbrGltfState state, PbrDirections directions, PbrNormals normals)
{
    return evalPbrBsdf_0(pbrToGeneratedGltfMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

float pbrPdfGltfState(PbrGltfState state, PbrDirections directions, PbrNormals normals)
{
    return pdfPbrBsdf_0(pbrToGeneratedGltfMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

PbrSample pbrSampleGltfState(PbrGltfState state, PbrDirections directions, PbrNormals normals, PbrRandoms randoms)
{
    return pbrFromGeneratedBsdfSample(samplePbrBsdf_0(pbrToGeneratedGltfMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals), pbrToGeneratedSampleRandoms(randoms)));
}

PbrVolume pbrPrepareVolumeFromGltfState(PbrGltfState state)
{
    return pbrFromGeneratedMaterialVolumeState(preparePbrVolumeState_0(pbrToGeneratedGltfMaterialBsdfState(state)));
}

PbrClosure pbrBuildClosure(PbrMaterial surface, PbrLayerNormals layerNormals, vec3 anisotropyTangent)
{
    return pbrFromGeneratedSurfaceClosure(buildPbrSurfaceClosure_0(pbrToGeneratedSurfaceMaterial(surface), pbrToGeneratedSurfaceLayerNormals(layerNormals), anisotropyTangent));
}

PbrState pbrPrepareState(PbrMaterial surface, PbrClosure closure, PbrTransport transport)
{
    PbrState stable;
    stable.surface = surface;
    stable.closure = closure;
    stable.currentMediumIor = max(transport.currentMediumIor, 1.0);
    return stable;
}

vec3 pbrEval(PbrState state, PbrDirections directions, PbrNormals normals)
{
    return evalPbrBsdf_0(pbrToGeneratedMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

float pbrPdf(PbrState state, PbrDirections directions, PbrNormals normals)
{
    return pdfPbrBsdf_0(pbrToGeneratedMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

PbrSample pbrSample(PbrState state, PbrDirections directions, PbrNormals normals, PbrRandoms randoms)
{
    return pbrFromGeneratedBsdfSample(samplePbrBsdf_0(pbrToGeneratedMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals), pbrToGeneratedSampleRandoms(randoms)));
}

PbrVolume pbrClearVolume()
{
    return pbrFromGeneratedMaterialVolumeState(clearPbrVolumeState_0());
}

PbrVolume pbrEnterVolume(PbrVolume volume)
{
    return pbrFromGeneratedMaterialVolumeState(enterPbrVolumeState_0(pbrToGeneratedMaterialVolumeState(volume)));
}

PbrVolume pbrPrepareVolume(PbrState state)
{
    return pbrFromGeneratedMaterialVolumeState(preparePbrVolumeState_0(pbrToGeneratedMaterialBsdfState(state)));
}

vec3 pbrEvalTransmittance(PbrVolume volume, float distance)
{
    return evalPbrHomogeneousTransmittance_0(pbrToGeneratedMaterialVolumeState(volume), distance);
}

float pbrMediumEventPdf(PbrVolume volume, float distance)
{
    return pbrHomogeneousMediumEventPdf_0(pbrToGeneratedMaterialVolumeState(volume), distance);
}

float pbrMediumNoEventPdf(PbrVolume volume, float distance)
{
    return pbrHomogeneousMediumNoEventPdf_0(pbrToGeneratedMaterialVolumeState(volume), distance);
}

float pbrEvalPhase(PbrVolume volume, vec3 incidentDir, vec3 outgoingDir)
{
    return evalPbrVolumePhase_0(pbrToGeneratedMaterialVolumeState(volume), incidentDir, outgoingDir);
}

float pbrPdfPhase(PbrVolume volume, vec3 incidentDir, vec3 outgoingDir)
{
    return pdfPbrVolumePhase_0(pbrToGeneratedMaterialVolumeState(volume), incidentDir, outgoingDir);
}

PbrPhaseSample pbrSamplePhase(PbrVolume volume, vec3 incidentDir, vec2 randoms)
{
    return pbrFromGeneratedVolumePhaseSample(samplePbrVolumePhase_0(pbrToGeneratedMaterialVolumeState(volume), incidentDir, randoms));
}
`,Fh=`// AUTO-GENERATED by tools/generate_slang_materials.mjs
// Include-safe GLSL library emitted by slang-pbr for webgl-full.
// Do not edit by hand.

float enterpriseApproxAverageAlbedoGGX_0(float alpha_0)
{

    float roughness_0 = sqrt(max(alpha_0, 0.0));
    return clamp(1.0 - 0.57999998331069946 * roughness_0 + 0.07999999821186066 * roughness_0 * roughness_0, 0.0, 1.0);
}


float enterpriseApproxAverageAlbedoGGXMs_0(float alpha_1, float e0_0)
{
    return clamp(clamp(e0_0 + (1.0 - e0_0) * 0.0476190485060215, 0.0, 1.0) * enterpriseApproxAverageAlbedoGGX_0(alpha_1), 0.0, 1.0);
}


float EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGXMs_0(float alpha_2, float e0_1)
{

    return enterpriseApproxAverageAlbedoGGXMs_0(alpha_2, e0_1);
}


float averageAlbedoGGXMsGeneric_0(float alpha_3, float e0_2)
{

    return EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGXMs_0(alpha_3, e0_2);
}


float enterpriseApproxDirectionalAlbedoGGX_0(float alpha_4, float cosTheta_0)
{



    return clamp(1.0 - sqrt(max(alpha_4, 0.0)) * (0.5 + 0.5 * pow(1.0 - clamp(cosTheta_0, 0.0, 1.0), 5.0)), 0.0, 1.0);
}


float enterpriseApproxDirectionalAlbedoGGXMs_0(float theta_0, float alpha_5, float e0_3)
{

    float noV_0 = clamp(theta_0, 0.0, 1.0);


    return clamp(clamp(e0_3 + (1.0 - e0_3) * pow(1.0 - noV_0, 5.0), 0.0, 1.0) * mix(1.0, enterpriseApproxDirectionalAlbedoGGX_0(alpha_5, noV_0), 0.64999997615814209), 0.0, 1.0);
}


float EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGXMs_0(float theta_1, float alpha_6, float e0_4)
{

    return enterpriseApproxDirectionalAlbedoGGXMs_0(theta_1, alpha_6, e0_4);
}


float directionalAlbedoGGXMsGeneric_0(float theta_2, float alpha_7, float e0_5)
{

    return EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGXMs_0(theta_2, alpha_7, e0_5);
}


float EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGX_0(float alpha_8)
{

    return enterpriseApproxAverageAlbedoGGX_0(alpha_8);
}


float averageAlbedoGGXGeneric_0(float alpha_9)
{

    return EnterpriseApproxMicrofacetEnergyProvider_averageAlbedoGGX_0(alpha_9);
}


float EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGX_0(float alpha_10, float cosTheta_1)
{

    return enterpriseApproxDirectionalAlbedoGGX_0(alpha_10, cosTheta_1);
}


float directionalAlbedoGGXGeneric_0(float alpha_11, float cosTheta_2)
{

    return EnterpriseApproxMicrofacetEnergyProvider_directionalAlbedoGGX_0(alpha_11, cosTheta_2);
}


struct GltfPbrMaterial_0
{
    vec4 baseColorFactor_0;
    float metallicFactor_0;
    float roughnessFactor_0;
    vec3 emissiveFactor_0;
    float emissiveStrength_0;
    float specularFactor_0;
    vec3 specularColorFactor_0;
    float transmissionFactor_0;
    float diffuseTransmissionFactor_0;
    vec3 diffuseTransmissionColorFactor_0;
    float ior_0;
    vec3 attenuationColor_0;
    float attenuationDistance_0;
    float thicknessFactor_0;
    vec3 multiscatterColorFactor_0;
    float scatterAnisotropy_0;
    float clearcoatFactor_0;
    float clearcoatRoughnessFactor_0;
    float clearcoatNormalTextureScale_0;
    vec3 sheenColorFactor_0;
    float sheenRoughnessFactor_0;
    float anisotropyStrength_0;
    float anisotropyRotation_0;
    float iridescenceFactor_0;
    float iridescenceIor_0;
    float iridescenceThickness_0;
    float dispersion_0;
    float normalTextureScale_0;
    uint featureMask_0;
};


GltfPbrMaterial_0 defaultGltfPbrMaterial_0()
{

    GltfPbrMaterial_0 material_0;
    material_0.baseColorFactor_0 = vec4(1.0);
    material_0.metallicFactor_0 = 1.0;
    material_0.roughnessFactor_0 = 1.0;
    const vec3 _S1 = vec3(0.0);

    material_0.emissiveFactor_0 = _S1;
    material_0.emissiveStrength_0 = 1.0;

    material_0.specularFactor_0 = 1.0;
    const vec3 _S2 = vec3(1.0);

    material_0.specularColorFactor_0 = _S2;

    material_0.transmissionFactor_0 = 0.0;
    material_0.diffuseTransmissionFactor_0 = 0.0;
    material_0.diffuseTransmissionColorFactor_0 = _S2;
    material_0.ior_0 = 1.5;
    material_0.attenuationColor_0 = _S2;
    material_0.attenuationDistance_0 = 1.00000002004087734e+20;
    material_0.thicknessFactor_0 = 0.0;
    material_0.multiscatterColorFactor_0 = _S1;
    material_0.scatterAnisotropy_0 = 0.0;

    material_0.clearcoatFactor_0 = 0.0;
    material_0.clearcoatRoughnessFactor_0 = 0.0;
    material_0.clearcoatNormalTextureScale_0 = 1.0;

    material_0.sheenColorFactor_0 = _S1;
    material_0.sheenRoughnessFactor_0 = 0.0;

    material_0.anisotropyStrength_0 = 0.0;
    material_0.anisotropyRotation_0 = 0.0;

    material_0.iridescenceFactor_0 = 0.0;
    material_0.iridescenceIor_0 = 1.29999995231628418;
    material_0.iridescenceThickness_0 = 400.0;

    material_0.dispersion_0 = 0.0;

    material_0.normalTextureScale_0 = 1.0;

    material_0.featureMask_0 = 0U;
    return material_0;
}
struct SurfaceMaterial_0
{
    vec3 albedo_0;
    float metallic_0;
    float roughness_1;
    float anisotropy_0;
    vec3 anisotropyDirection_0;
    float transparency_0;
    float ior_1;
    vec3 specularColor_0;
    float specular_0;
    vec3 emission_0;
    float normalScale_0;
    vec3 attenuationColor_1;
    float attenuationDistance_1;
    vec3 multiscatterColor_0;
    float scatterAnisotropy_1;
    float thinWalled_0;
    float translucency_0;
    vec3 translucencyColor_0;
    float iridescence_0;
    float iridescenceIor_1;
    float iridescenceThickness_1;
    float dispersion_1;
    float clearcoat_0;
    float clearcoatRoughness_0;
    vec3 sheenColor_0;
    float sheenRoughness_0;
    float clearcoatNormalScale_0;
    float frontFaceEmissionOnly_0;
};


SurfaceMaterial_0 buildEnterpriseSurfaceFromGltf_0(GltfPbrMaterial_0 material_2)
{

    SurfaceMaterial_0 surface_0;
    const vec3 _S4 = vec3(0.0);

    const vec3 _S5 = vec3(1.0);

    surface_0.albedo_0 = clamp(material_2.baseColorFactor_0.xyz, _S4, _S5);
    surface_0.metallic_0 = clamp(material_2.metallicFactor_0, 0.0, 1.0);
    surface_0.roughness_1 = clamp(material_2.roughnessFactor_0, 0.0, 1.0);
    surface_0.anisotropy_0 = clamp(material_2.anisotropyStrength_0, 0.0, 1.0);
    surface_0.anisotropyDirection_0 = vec3(cos(material_2.anisotropyRotation_0), sin(material_2.anisotropyRotation_0), 0.0);
    surface_0.transparency_0 = clamp(material_2.transmissionFactor_0, 0.0, 1.0);
    surface_0.ior_1 = max(material_2.ior_0, 1.0);
    surface_0.specularColor_0 = clamp(material_2.specularColorFactor_0, _S4, _S5);
    surface_0.specular_0 = clamp(material_2.specularFactor_0, 0.0, 1.0);
    surface_0.emission_0 = max(material_2.emissiveFactor_0 * material_2.emissiveStrength_0, _S4);
    surface_0.normalScale_0 = material_2.normalTextureScale_0;
    surface_0.attenuationColor_1 = max(material_2.attenuationColor_0, vec3(0.00009999999747379));
    surface_0.attenuationDistance_1 = max(material_2.attenuationDistance_0, 0.00009999999747379);
    surface_0.multiscatterColor_0 = clamp(material_2.multiscatterColorFactor_0, _S4, _S5);
    surface_0.scatterAnisotropy_1 = clamp(material_2.scatterAnisotropy_0, -0.99900001287460327, 1.0);

    float _S6;
    if((material_2.thicknessFactor_0) > 0.0)
    {

        _S6 = 0.0;

    }
    else
    {

        _S6 = 1.0;

    }

    surface_0.thinWalled_0 = _S6;
    surface_0.translucency_0 = clamp(material_2.diffuseTransmissionFactor_0, 0.0, 1.0);
    surface_0.translucencyColor_0 = clamp(material_2.diffuseTransmissionColorFactor_0, _S4, _S5);
    surface_0.iridescence_0 = clamp(material_2.iridescenceFactor_0, 0.0, 1.0);
    surface_0.iridescenceIor_1 = clamp(material_2.iridescenceIor_0, 1.0, 2.5);
    surface_0.iridescenceThickness_1 = max(material_2.iridescenceThickness_0, 0.0);
    surface_0.dispersion_1 = max(material_2.dispersion_0, 0.0);
    surface_0.clearcoat_0 = clamp(material_2.clearcoatFactor_0, 0.0, 1.0);
    surface_0.clearcoatRoughness_0 = clamp(material_2.clearcoatRoughnessFactor_0, 0.0, 1.0);
    surface_0.sheenColor_0 = clamp(material_2.sheenColorFactor_0, _S4, _S5);
    surface_0.sheenRoughness_0 = clamp(material_2.sheenRoughnessFactor_0, 0.0, 1.0);
    surface_0.clearcoatNormalScale_0 = material_2.clearcoatNormalTextureScale_0;
    surface_0.frontFaceEmissionOnly_0 = 0.0;
    return surface_0;
}


SurfaceMaterial_0 buildPbrSurfaceFromGltf_0(GltfPbrMaterial_0 material_3)
{
    return buildEnterpriseSurfaceFromGltf_0(material_3);
}


struct SurfaceLayerNormals_0
{
    vec3 rawGeometry_0;
    vec3 geometry_0;
    vec3 shadingGeometry_0;
    vec3 interfaceBase_0;
    vec3 base_0;
    vec3 clearcoat_1;
    vec3 anisotropyTangent_0;
};
vec3 clamp01_0(vec3 v_0)
{

    return clamp(v_0, vec3(0.0), vec3(1.0));
}


vec3 schlickAverageWeight_0(vec3 f0_0, vec3 f90_0)
{

    return f0_0 + (f90_0 - f0_0) * 0.0476190485060215;
}


float materialRoughnessForBsdf_0(float roughness_2)
{

    return clamp(max(roughness_2, 0.0020000000949949), 0.0, 1.0);
}

float max3_0(vec3 v_1)
{

    return max(v_1.x, max(v_1.y, v_1.z));
}


float iridescenceInterfaceWeight_0(float iridescence_1, float filmIor_0)
{

    float _S8 = max(filmIor_0, 1.0);

    return clamp(iridescence_1, 0.0, 1.0) * pow((_S8 - 1.0) / max(_S8 + 1.0, 0.00000999999974738), 2.0);
}


struct SurfaceClosure_0
{
    vec3 diffuseColor_0;
    vec3 diffuseReflectionColor_0;
    vec3 transmissionColor_0;
    float diffuseWeight_0;
    float sheenWeight_0;
    float anisotropy_1;
    vec3 anisotropyTangent_1;
    vec3 specularColor_1;
    vec3 specularF90_0;
    vec3 dielectricSpecularColor_0;
    vec3 dielectricSpecularF90_0;
    float dielectricWeight_0;
    float specularWeight_0;
    float clearcoatWeight_0;
    float roughness_3;
    vec3 sheenColor_1;
    float sheenRoughness_1;
    float transparency_1;
    float clearcoat_2;
    float clearcoatRoughness_1;
    vec3 throughput_0;
    float metallic_1;
    float specular_1;
    float ior_2;
    float iridescence_2;
    float iridescenceIor_2;
    float iridescenceThickness_2;
    float dispersion_2;
    float thinWalled_1;
    vec3 attenuationColor_2;
    float attenuationDistance_2;
    vec3 multiscatterColor_1;
    float scatterAnisotropy_2;
    float transmissionWeight_0;
    vec3 diffuseTransmissionColor_0;
    float diffuseTransmissionWeight_0;
};


SurfaceClosure_0 buildSurfaceClosure_0(SurfaceMaterial_0 surface_1, SurfaceLayerNormals_0 layerNormals_0, vec3 anisotropyTangent_2)
{

    float dielectricWeight_1 = 1.0 - surface_1.metallic_0;

    float _S9 = 1.0 - surface_1.transparency_0;

    float opaqueDielectricWeight_0 = dielectricWeight_1 * _S9;
    float transparentDielectricWeight_0 = dielectricWeight_1 * surface_1.transparency_0;
    vec3 diffuseReflectionColor_1 = surface_1.albedo_0 * opaqueDielectricWeight_0 * (1.0 - surface_1.translucency_0);
    vec3 diffuseTransmissionColor_1 = opaqueDielectricWeight_0 * surface_1.translucencyColor_0 * surface_1.translucency_0;

    float iorRatio_0 = (1.0 - surface_1.ior_1) / (1.0 + surface_1.ior_1);

    vec3 dielectricF0_0 = clamp01_0(vec3(iorRatio_0 * iorRatio_0 * surface_1.specular_0) * surface_1.specularColor_0);

    const vec3 _S10 = vec3(1.0);

    vec3 metalSpecularEnergy_0 = schlickAverageWeight_0(surface_1.albedo_0, _S10);
    vec3 weightedTransmissionColor_0 = surface_1.albedo_0 * transparentDielectricWeight_0;
    float materialRoughness_0 = materialRoughnessForBsdf_0(surface_1.roughness_1);
    float clearcoatRoughness_2 = materialRoughnessForBsdf_0(surface_1.clearcoatRoughness_0);

    SurfaceClosure_0 closure_0;
    closure_0.diffuseColor_0 = surface_1.albedo_0;
    closure_0.diffuseReflectionColor_0 = diffuseReflectionColor_1;
    closure_0.transmissionColor_0 = surface_1.albedo_0;
    closure_0.diffuseWeight_0 = max3_0(diffuseReflectionColor_1);
    closure_0.sheenWeight_0 = max3_0(surface_1.sheenColor_0) * _S9;
    closure_0.anisotropy_1 = surface_1.anisotropy_0;
    closure_0.anisotropyTangent_1 = anisotropyTangent_2;
    closure_0.specularColor_1 = surface_1.albedo_0;
    closure_0.specularF90_0 = _S10;
    closure_0.dielectricSpecularColor_0 = dielectricF0_0;
    closure_0.dielectricSpecularF90_0 = vec3(surface_1.specular_0);
    closure_0.dielectricWeight_0 = dielectricWeight_1;


    float filmWeight_0 = iridescenceInterfaceWeight_0(surface_1.iridescence_0, surface_1.iridescenceIor_1);
    closure_0.specularWeight_0 = max(max3_0(metalSpecularEnergy_0), filmWeight_0) * surface_1.metallic_0;
    closure_0.clearcoatWeight_0 = surface_1.clearcoat_0 * mix(0.20000000298023224, 1.0, 1.0 - clearcoatRoughness_2);
    closure_0.roughness_3 = materialRoughness_0;
    closure_0.sheenColor_1 = surface_1.sheenColor_0;
    closure_0.sheenRoughness_1 = surface_1.sheenRoughness_0;
    closure_0.transparency_1 = surface_1.transparency_0;
    closure_0.clearcoat_2 = surface_1.clearcoat_0;
    closure_0.clearcoatRoughness_1 = clearcoatRoughness_2;
    closure_0.throughput_0 = clamp01_0(diffuseReflectionColor_1 + diffuseTransmissionColor_1 + weightedTransmissionColor_0 + max(metalSpecularEnergy_0, vec3(filmWeight_0)) * surface_1.metallic_0 + dielectricF0_0 * dielectricWeight_1 + surface_1.sheenColor_0);

    closure_0.metallic_1 = surface_1.metallic_0;
    closure_0.specular_1 = surface_1.specular_0;
    closure_0.ior_2 = surface_1.ior_1;
    closure_0.iridescence_2 = surface_1.iridescence_0;
    closure_0.iridescenceIor_2 = surface_1.iridescenceIor_1;
    closure_0.iridescenceThickness_2 = surface_1.iridescenceThickness_1;
    closure_0.dispersion_2 = surface_1.dispersion_1;
    closure_0.thinWalled_1 = surface_1.thinWalled_0;
    closure_0.attenuationColor_2 = surface_1.attenuationColor_1;
    closure_0.attenuationDistance_2 = surface_1.attenuationDistance_1;
    closure_0.multiscatterColor_1 = surface_1.multiscatterColor_0;
    closure_0.scatterAnisotropy_2 = surface_1.scatterAnisotropy_1;
    closure_0.transmissionWeight_0 = max3_0(surface_1.albedo_0) * transparentDielectricWeight_0;
    closure_0.diffuseTransmissionColor_0 = diffuseTransmissionColor_1;
    closure_0.diffuseTransmissionWeight_0 = max3_0(diffuseTransmissionColor_1);
    return closure_0;
}


SurfaceClosure_0 buildPbrSurfaceClosure_0(SurfaceMaterial_0 surface_2, SurfaceLayerNormals_0 layerNormals_1, vec3 anisotropyTangent_3)
{



    return buildSurfaceClosure_0(surface_2, layerNormals_1, anisotropyTangent_3);
}


struct MaterialBsdfState_0
{
    SurfaceClosure_0 closure_1;
    float currentMediumIor_0;
};


struct TransportContext_0
{
    float currentMediumIor_1;
    float interfaceIor_0;
    float thinWalled_2;
    float _pad0_0;
};


MaterialBsdfState_0 prepareMaterialBsdfState_0(SurfaceMaterial_0 surface_3, SurfaceClosure_0 closure_2, TransportContext_0 transportContext_0)
{


    MaterialBsdfState_0 state_0;
    state_0.closure_1 = closure_2;
    state_0.currentMediumIor_0 = max(transportContext_0.currentMediumIor_1, 1.0);
    return state_0;
}


MaterialBsdfState_0 preparePbrBsdfState_0(SurfaceMaterial_0 surface_4, SurfaceClosure_0 closure_3, TransportContext_0 transportContext_1)
{



    return prepareMaterialBsdfState_0(surface_4, closure_3, transportContext_1);
}


vec3 evalDiffuseTransmission_0(SurfaceClosure_0 closure_4, vec3 normal_0, vec3 lightDir_0)
{
    return closure_4.diffuseTransmissionColor_0 * 0.31830987334251404 * max(abs(dot(normal_0, lightDir_0)), 0.0);
}


float transparentDielectricWeight_1(SurfaceClosure_0 closure_5)
{

    return closure_5.dielectricWeight_0 * closure_5.transparency_1;
}


vec3 projectToAnisotropicFrame_0(vec3 normal_1, vec3 tangent_0, vec3 dir_0)
{

    vec3 safeTangent_0 = normalize(tangent_0 - normal_1 * dot(tangent_0, normal_1));

    return vec3(dot(dir_0, safeTangent_0), dot(dir_0, normalize(cross(normal_1, safeTangent_0))), dot(dir_0, normal_1));
}


vec2 anisotropicAlpha_0(float roughness_4, float anisotropy_2)
{

    float clampedAnisotropy_0 = clamp(anisotropy_2, 0.0, 1.0);
    float _S11 = max(roughness_4 * roughness_4, 0.0);

    return vec2(mix(_S11, 1.0, clampedAnisotropy_0 * clampedAnisotropy_0), _S11);
}


float ggxDistributionAnisotropic_0(vec2 alpha_12, vec3 localH_0)
{

    float _S12 = alpha_12.x;

    float hx_0 = localH_0.x / _S12;
    float _S13 = alpha_12.y;

    float hy_0 = localH_0.y / _S13;
    float _S14 = localH_0.z;
    float denom_0 = hx_0 * hx_0 + hy_0 * hy_0 + _S14 * _S14;
    return 1.0 / max(3.14159274101257324 * _S12 * _S13 * denom_0 * denom_0, 9.999999960041972e-13);
}


float ggxSmithLambdaAnisotropic_0(vec2 alpha_13, vec3 localDir_0)
{

    float _S15 = localDir_0.z;

    float cosTheta2_0 = _S15 * _S15;
    if(cosTheta2_0 <= 9.99999993922529029e-09)
    {

        return 0.0;
    }

    if((max(1.0 - cosTheta2_0, 0.0)) <= 9.99999993922529029e-09)
    {

        return 0.0;
    }

    float _S16 = localDir_0.x;

    float _S17 = alpha_13.x;

    float _S18 = localDir_0.y;

    float _S19 = alpha_13.y;

    return 0.5 * (-1.0 + sqrt(1.0 + (_S16 * _S16 * _S17 * _S17 + _S18 * _S18 * _S19 * _S19) / max(cosTheta2_0, 9.99999993922529029e-09)));
}

float ggxSmithG2Anisotropic_0(vec2 alpha_14, vec3 localView_0, vec3 localLight_0)
{

    return 1.0 / (1.0 + ggxSmithLambdaAnisotropic_0(alpha_14, localView_0) + ggxSmithLambdaAnisotropic_0(alpha_14, localLight_0));
}


vec3 evaluateMicrofacetResponseAnisotropic_0(float roughness_5, float anisotropy_3, vec3 normal_2, vec3 tangent_1, vec3 viewDir_0, vec3 lightDir_1)
{

    vec3 halfVec_0 = normalize(viewDir_0 + lightDir_1);
    vec3 localView_1 = projectToAnisotropicFrame_0(normal_2, tangent_1, viewDir_0);
    vec3 localLight_1 = projectToAnisotropicFrame_0(normal_2, tangent_1, lightDir_1);
    vec3 localHalf_0 = projectToAnisotropicFrame_0(normal_2, tangent_1, halfVec_0);
    float noV_1 = abs(localView_1.z);
    float noL_0 = abs(localLight_1.z);
    float noH_0 = abs(localHalf_0.z);
    float _S20 = max(dot(viewDir_0, halfVec_0), 0.0);

    bool _S21;
    if(noV_1 <= 0.0)
    {

        _S21 = true;

    }
    else
    {

        _S21 = noL_0 <= 0.0;

    }

    if(_S21)
    {

        _S21 = true;

    }
    else
    {

        _S21 = noH_0 <= 0.0;

    }

    if(_S21)
    {

        _S21 = true;

    }
    else
    {

        _S21 = _S20 <= 0.0;

    }

    if(_S21)
    {

        return vec3(0.0);
    }

    vec2 alpha_15 = anisotropicAlpha_0(roughness_5, anisotropy_3);


    return vec3(ggxDistributionAnisotropic_0(alpha_15, localHalf_0) * ggxSmithG2Anisotropic_0(alpha_15, localView_1, localLight_1) / max(4.0 * noV_1 * noL_0, 0.00000999999974738));
}


float directionalAlbedoGGX_0(float alpha_16, float cosTheta_3)
{

    return directionalAlbedoGGXGeneric_0(alpha_16, cosTheta_3);
}

float averageAlbedoGGX_0(float alpha_17)
{

    return averageAlbedoGGXGeneric_0(alpha_17);
}


struct DielectricFresnelAngles_0
{
    float schlickCosTheta_0;
    bool totalInternalReflection_0;
};


DielectricFresnelAngles_0 dielectricFresnelAngles_0(float cosTheta_4, float ni_0, float nt_0, bool thinWalled_3)
{

    float cosI_0 = clamp(cosTheta_4, 0.0, 1.0);
    float eta_0 = ni_0 / max(nt_0, 0.00000999999974738);
    float sinT2_0 = eta_0 * eta_0 * max(1.0 - cosI_0 * cosI_0, 0.0);
    DielectricFresnelAngles_0 result_0;

    bool _S22;
    if(sinT2_0 >= 1.0)
    {

        _S22 = !thinWalled_3;

    }
    else
    {

        _S22 = false;

    }

    if(_S22)
    {

        result_0.schlickCosTheta_0 = 0.0;
        result_0.totalInternalReflection_0 = true;
        return result_0;
    }
    float cosT_0 = sqrt(max(1.0 - sinT2_0, 0.0));
    if(nt_0 >= ni_0)
    {

        _S22 = true;

    }
    else
    {

        _S22 = thinWalled_3;

    }

    float _S23;

    if(_S22)
    {

        _S23 = cosI_0;

    }
    else
    {

        _S23 = cosT_0;

    }

    result_0.schlickCosTheta_0 = _S23;
    result_0.totalInternalReflection_0 = false;
    return result_0;
}


vec3 fresnelSchlick_0(vec3 f0_1, vec3 f90_1, float cosTheta_5)
{

    float m_0 = clamp(1.0 - cosTheta_5, 0.0, 1.0);
    float m2_0 = m_0 * m_0;

    return f0_1 + (f90_1 - f0_1) * (m2_0 * m2_0 * m_0);
}


vec3 fresnelSchlickDielectric_0(float cosTheta_6, vec3 f0_2, vec3 f90_2, float ni_1, float nt_1, bool thinWalled_4)
{

    if((abs(ni_1 - nt_1)) <= 0.00009999999747379)
    {

        return vec3(0.0);
    }
    DielectricFresnelAngles_0 angles_0 = dielectricFresnelAngles_0(cosTheta_6, ni_1, nt_1, thinWalled_4);
    vec3 schlick_0 = fresnelSchlick_0(f0_2, f90_2, angles_0.schlickCosTheta_0);

    vec3 _S24;
    if(angles_0.totalInternalReflection_0)
    {

        _S24 = vec3(1.0);

    }
    else
    {

        _S24 = schlick_0;

    }

    return _S24;
}


float thinFilmIorToFresnel0_0(float transmittedIor_0, float incidentIor_0)
{

    float ratio_0 = (transmittedIor_0 - incidentIor_0) / max(transmittedIor_0 + incidentIor_0, 0.00000999999974738);
    return ratio_0 * ratio_0;
}

vec3 thinFilmDielectricSubstrateF0_0(float ior_3, float outsideIor_0)
{

    return vec3(thinFilmIorToFresnel0_0(max(ior_3, 1.0), max(outsideIor_0, 1.0)));
}

vec3 thinFilmFresnel0ToIor_0(vec3 f0_3)
{

    vec3 sqrtF0_0 = sqrt(clamp(f0_3, vec3(0.0), vec3(0.99989998340606689)));
    const vec3 _S25 = vec3(1.0);

    return (_S25 + sqrtF0_0) / max(_S25 - sqrtF0_0, vec3(0.00000999999974738));
}

vec3 thinFilmSensitivity_0(float opdNm_0, vec3 shift_0)
{

    float phase_0 = 6.28318548202514648 * opdNm_0 * 9.99999971718068537e-10;
    float phase2_0 = phase_0 * phase_0;


    const vec3 variance_0 = vec3(4.327799808e+09, 9.304599552e+09, 6.612100096e+09);
    vec3 xyz_0 = vec3(5.48560003844900113e-13, 4.42010008238832852e-13, 5.24810013155518895e-13) * sqrt(6.28318548202514648 * variance_0) * cos(vec3(1.681e+06, 1.7953e+06, 2.2084e+06) * phase_0 + shift_0) * exp(- phase2_0 * variance_0);
    xyz_0[0] = xyz_0[0] + 9.74699989231449238e-14 * sqrt(2.845152256e+10) * cos(2.2399e+06 * phase_0 + shift_0.x) * exp(-4.528200192e+09 * phase2_0);
    vec3 _S26 = xyz_0 / 1.06850002623559703e-07;

    xyz_0 = _S26;

    float _S27 = _S26.x;

    float _S28 = _S26.y;

    float _S29 = _S26.z;

    return vec3(3.24045419692993164 * _S27 - 1.53713846206665039 * _S28 - 0.49853140115737915 * _S29, -0.96926599740982056 * _S27 + 1.87601077556610107 * _S28 + 0.04155600070953369 * _S29, 0.05564339831471443 * _S27 - 0.20402589440345764 * _S28 + 1.05722522735595703 * _S29);
}




vec3 thinFilmReflectance_0(float outsideIor_1, float filmIor_1, vec3 baseF0_0, float thicknessNm_0, float cosTheta1_0)
{

    float safeFilmIor_0 = clamp(filmIor_1, 1.0, 2.5);
    float safeCosTheta1_0 = clamp(cosTheta1_0, 0.0, 1.0);

    float cosTheta2Sq_0 = 1.0 - outsideIor_1 / safeFilmIor_0 * (outsideIor_1 / safeFilmIor_0) * (1.0 - safeCosTheta1_0 * safeCosTheta1_0);
    if(cosTheta2Sq_0 < 0.0)
    {

        return vec3(1.0);
    }
    float cosTheta2_1 = sqrt(cosTheta2Sq_0);


    const vec3 _S30 = vec3(1.0);

    float r12_0 = fresnelSchlick_0(vec3(thinFilmIorToFresnel0_0(safeFilmIor_0, outsideIor_1)), _S30, safeCosTheta1_0).x;
    float t121_0 = 1.0 - r12_0;
    vec3 baseIor_0 = thinFilmFresnel0ToIor_0(baseF0_0);
    vec3 _S31 = vec3(safeFilmIor_0);

    const vec3 _S32 = vec3(0.00000999999974738);

    vec3 r1Ratio_0 = (baseIor_0 - _S31) / max(baseIor_0 + _S31, _S32);

    vec3 r23_0 = fresnelSchlick_0(r1Ratio_0 * r1Ratio_0, _S30, cosTheta2_1);

    float _S33 = 2.0 * safeFilmIor_0 * max(thicknessNm_0, 0.0) * cosTheta2_1;

    float phi12_0;
    if(safeFilmIor_0 < outsideIor_1)
    {

        phi12_0 = 3.14159274101257324;

    }
    else
    {

        phi12_0 = 0.0;

    }
    float phi21_0 = 3.14159274101257324 - phi12_0;

    if((baseIor_0.x) < safeFilmIor_0)
    {

        phi12_0 = 3.14159274101257324;

    }
    else
    {

        phi12_0 = 0.0;

    }

    float _S34;
    if((baseIor_0.y) < safeFilmIor_0)
    {

        _S34 = 3.14159274101257324;

    }
    else
    {

        _S34 = 0.0;

    }

    float _S35;
    if((baseIor_0.z) < safeFilmIor_0)
    {

        _S35 = 3.14159274101257324;

    }
    else
    {

        _S35 = 0.0;

    }
    vec3 _S36 = vec3(phi21_0) + vec3(phi12_0, _S34, _S35);
    vec3 _S37 = vec3(r12_0);

    vec3 r123_0 = clamp(_S37 * r23_0, _S32, vec3(0.99989998340606689));
    vec3 _S38 = sqrt(r123_0);
    vec3 rs_0 = t121_0 * t121_0 * r23_0 / max(_S30 - r123_0, _S32);

    vec3 _S39 = _S37 + rs_0;
    vec3 _S40 = rs_0 - vec3(t121_0);

    int m_1 = 1;

    vec3 cm_0 = _S40;

    vec3 reflectance_0 = _S39;
    for(;;)
    {

        if(m_1 <= 2)
        {
        }
        else
        {

            break;
        }

        vec3 cm_1 = cm_0 * _S38;
        float _S41 = float(m_1);

        vec3 reflectance_1 = reflectance_0 + cm_1 * 2.0 * thinFilmSensitivity_0(_S41 * _S33, _S41 * _S36);

        m_1 = m_1 + 1;

        cm_0 = cm_1;

        reflectance_0 = reflectance_1;

    }



    return max(reflectance_0, vec3(0.0));
}

vec3 thinFilmMixFresnel_0(vec3 regularF_0, vec3 filmF_0, float iridescence_3)
{

    return mix(regularF_0, filmF_0, vec3(clamp(iridescence_3, 0.0, 1.0)));
}

vec3 thinFilmDielectricFresnel_0(SurfaceClosure_0 closure_6, float cosTheta_7, vec3 regularF_1, float incidentIor_1)
{



    if((closure_6.iridescence_2) <= 0.00000999999974738)
    {

        return regularF_1;
    }
    return thinFilmMixFresnel_0(regularF_1, thinFilmReflectance_0(max(incidentIor_1, 1.0), closure_6.iridescenceIor_2, thinFilmDielectricSubstrateF0_0(closure_6.ior_2, incidentIor_1), closure_6.iridescenceThickness_2, cosTheta_7), closure_6.iridescence_2);
}


vec3 fresnelSchlickAverage_0(vec3 f0_4, vec3 f90_3)
{

    return f0_4 + (f90_3 - f0_4) * 0.0476190485060215;
}


vec3 evaluateDielectricSpecularGGX_0(SurfaceClosure_0 closure_7, vec3 normal_3, vec3 viewDir_1, vec3 lightDir_2, float iorI_0, float iorO_0)
{

    float _S42 = max(dot(normal_3, lightDir_2), 0.0);
    float transparentWeight_0 = transparentDielectricWeight_1(closure_7);

    bool _S43;
    if(_S42 <= 0.0)
    {

        _S43 = true;

    }
    else
    {

        _S43 = transparentWeight_0 <= 0.0;

    }

    if(_S43)
    {

        return vec3(0.0);
    }
    vec3 microfacetResponse_0 = evaluateMicrofacetResponseAnisotropic_0(closure_7.roughness_3, closure_7.anisotropy_1, normal_3, closure_7.anisotropyTangent_1, viewDir_1, lightDir_2);

    float _S44 = max(dot(viewDir_1, normalize(viewDir_1 + lightDir_2)), 0.0);
    float _S45 = max(closure_7.roughness_3 * closure_7.roughness_3, 0.0);



    float eAvg_0 = averageAlbedoGGX_0(_S45);
    float _S46 = 1.0 - eAvg_0;

    float ms_0 = (1.0 - directionalAlbedoGGX_0(_S45, _S42)) * (1.0 - directionalAlbedoGGX_0(_S45, abs(dot(normal_3, viewDir_1)))) / max(3.14159274101257324 * _S46, 9.99999997475242708e-07);
    vec3 regularF_2 = fresnelSchlickDielectric_0(_S44, closure_7.dielectricSpecularColor_0, closure_7.dielectricSpecularF90_0, iorI_0, iorO_0, false);

    if((closure_7.iridescence_2) > 0.00000999999974738)
    {

        _S43 = iorI_0 <= 1.00010001659393311;

    }
    else
    {

        _S43 = false;

    }

    vec3 f_0;

    if(_S43)
    {

        f_0 = thinFilmDielectricFresnel_0(closure_7, _S44, regularF_2, 1.0);

    }
    else
    {

        f_0 = regularF_2;

    }

    vec3 fAvg_0;



    if((abs(iorI_0 - iorO_0)) <= 0.00009999999747379)
    {

        fAvg_0 = vec3(0.0);

    }
    else
    {

        fAvg_0 = fresnelSchlickAverage_0(closure_7.dielectricSpecularColor_0, closure_7.dielectricSpecularF90_0);

    }



    return transparentWeight_0 * (microfacetResponse_0 * f_0 + ms_0 * (fAvg_0 * fAvg_0 * eAvg_0 / max(vec3(1.0) - fAvg_0 * _S46, vec3(0.00000999999974738)))) * _S42;
}


vec3 weightedTransmissionColor_1(SurfaceClosure_0 closure_8)
{

    return closure_8.transmissionColor_0 * transparentDielectricWeight_1(closure_8);
}


float maxWeightedComponent_0(vec3 weight_0, vec3 value_0)
{

    const vec3 _S47 = vec3(0.0);
    return max3_0(max(weight_0, _S47) * max(value_0, _S47));
}


vec2 reflectionTransmissionProbabilities_0(vec3 throughput_1, vec3 reflectionCoeff_0, vec3 transmissionCoeff_0)
{

    float reflectionWeight_0 = maxWeightedComponent_0(throughput_1, reflectionCoeff_0);
    float transmissionWeight_1 = maxWeightedComponent_0(throughput_1, transmissionCoeff_0);
    float totalWeight_0 = reflectionWeight_0 + transmissionWeight_1;
    if(totalWeight_0 <= 0.00000999999974738)
    {

        return vec2(1.0, 0.0);
    }
    return vec2(reflectionWeight_0 / totalWeight_0, transmissionWeight_1 / totalWeight_0);
}


struct DielectricTransmissionCoefficients_0
{
    vec3 reflectionCoeff_1;
    vec3 transmissionCoeff_1;
    float reflectionProb_0;
    float transmissionProb_0;
};


DielectricTransmissionCoefficients_0 computeDielectricTransmissionCoefficients_0(SurfaceClosure_0 closure_9, float currentMediumIor_2, vec3 baseNormal_0, vec3 viewDir_2, float iorI_1, float iorO_1)
{

    float _S48 = max(dot(baseNormal_0, viewDir_2), 0.00000999999974738);
    vec3 fresnelReflect_0 = fresnelSchlickDielectric_0(_S48, closure_9.dielectricSpecularColor_0, closure_9.dielectricSpecularF90_0, iorI_1, iorO_1, false);

    bool _S49;

    if((closure_9.iridescence_2) > 0.00000999999974738)
    {

        _S49 = iorI_1 <= 1.00010001659393311;

    }
    else
    {

        _S49 = false;

    }

    vec3 filmReflect_0;

    if(_S49)
    {

        filmReflect_0 = thinFilmDielectricFresnel_0(closure_9, _S48, fresnelReflect_0, 1.0);

    }
    else
    {

        filmReflect_0 = fresnelReflect_0;

    }


    vec3 reflectionCoeff_2 = filmReflect_0 * transparentDielectricWeight_1(closure_9);
    vec3 transmissionCoeff_2 = (vec3(1.0) - filmReflect_0) * weightedTransmissionColor_1(closure_9);

    vec2 probs_0 = reflectionTransmissionProbabilities_0(max(closure_9.throughput_0, vec3(max(currentMediumIor_2, 0.00000999999974738))), reflectionCoeff_2, transmissionCoeff_2);

    DielectricTransmissionCoefficients_0 coeffs_0;
    coeffs_0.reflectionCoeff_1 = reflectionCoeff_2;
    coeffs_0.transmissionCoeff_1 = transmissionCoeff_2;
    coeffs_0.reflectionProb_0 = probs_0.x;
    coeffs_0.transmissionProb_0 = probs_0.y;
    return coeffs_0;
}


vec3 flipAcrossNormal_0(vec3 v_2, vec3 n_0)
{

    return normalize(v_2 - 2.0 * n_0 * dot(v_2, n_0));
}


vec3 evaluateThinTransmissionScattering_0(SurfaceClosure_0 closure_10, vec3 normal_4, vec3 viewDir_3, vec3 lightDir_3, float iorI_2, float iorO_2)
{

    float _S50 = dot(normal_4, lightDir_3);

    if((dot(normal_4, viewDir_3) * _S50) >= 0.0)
    {

        return vec3(0.0);
    }
    vec3 mirroredLightDir_0 = flipAcrossNormal_0(lightDir_3, normal_4);

    float _S51 = max(dot(viewDir_3, normalize(viewDir_3 + mirroredLightDir_0)), 0.00000999999974738);
    vec3 regularReflect_0 = fresnelSchlickDielectric_0(_S51, closure_10.dielectricSpecularColor_0, closure_10.dielectricSpecularF90_0, iorI_2, iorO_2, true);

    bool _S52;

    if((closure_10.iridescence_2) > 0.00000999999974738)
    {

        _S52 = iorI_2 <= 1.00010001659393311;

    }
    else
    {

        _S52 = false;

    }

    vec3 filmReflect_1;

    if(_S52)
    {

        filmReflect_1 = thinFilmDielectricFresnel_0(closure_10, _S51, regularReflect_0, 1.0);

    }
    else
    {

        filmReflect_1 = regularReflect_0;

    }

    return weightedTransmissionColor_1(closure_10) * (vec3(1.0) - filmReflect_1) * evaluateMicrofacetResponseAnisotropic_0(closure_10.roughness_3, closure_10.anisotropy_1, normal_4, closure_10.anisotropyTangent_1, viewDir_3, mirroredLightDir_0) * abs(_S50);
}

vec3 evaluateThickTransmissionScattering_0(SurfaceClosure_0 closure_11, vec3 transmissionCoeff_3, vec3 normal_5, vec3 viewDir_4, vec3 lightDir_4, float iorI_3, float iorO_3)
{

    vec3 localView_2 = projectToAnisotropicFrame_0(normal_5, closure_11.anisotropyTangent_1, viewDir_4);
    vec3 localLight_2 = projectToAnisotropicFrame_0(normal_5, closure_11.anisotropyTangent_1, lightDir_4);
    float noV_2 = abs(localView_2.z);
    float noL_1 = abs(localLight_2.z);

    bool _S53;
    if(noV_2 <= 0.00000999999974738)
    {

        _S53 = true;

    }
    else
    {

        _S53 = noL_1 <= 0.00000999999974738;

    }

    if(_S53)
    {

        _S53 = true;

    }
    else
    {

        _S53 = (dot(normal_5, viewDir_4) * dot(normal_5, lightDir_4)) >= 0.0;

    }

    if(_S53)
    {

        return vec3(0.0);
    }

    float etaRatio_0 = iorO_3 / max(iorI_3, 0.00000999999974738);
    vec3 halfVec_1 = - normalize(viewDir_4 + lightDir_4 * etaRatio_0);
    vec3 localHalf_1 = projectToAnisotropicFrame_0(normal_5, closure_11.anisotropyTangent_1, halfVec_1);

    float voH_0 = dot(viewDir_4, halfVec_1);
    float loH_0 = dot(lightDir_4, halfVec_1);
    if((abs(localHalf_1.z)) <= 0.00000999999974738)
    {

        _S53 = true;

    }
    else
    {

        _S53 = (voH_0 * loH_0) >= 0.0;

    }

    if(_S53)
    {

        return vec3(0.0);
    }

    vec2 alpha_18 = anisotropicAlpha_0(closure_11.roughness_3, closure_11.anisotropy_1);
    float d_0 = ggxDistributionAnisotropic_0(alpha_18, localHalf_1);
    float g_0 = ggxSmithG2Anisotropic_0(alpha_18, localView_2, localLight_2);

    float _S54 = abs(voH_0);

    float factor_0 = etaRatio_0 * etaRatio_0 * _S54 * abs(loH_0) / max(pow(voH_0 + etaRatio_0 * loH_0, 2.0) * noV_2, 0.00000999999974738);
    vec3 regularReflect_1 = fresnelSchlickDielectric_0(_S54, closure_11.dielectricSpecularColor_0, closure_11.dielectricSpecularF90_0, iorI_3, iorO_3, false);

    if((closure_11.iridescence_2) > 0.00000999999974738)
    {

        _S53 = iorI_3 <= 1.00010001659393311;

    }
    else
    {

        _S53 = false;

    }

    vec3 effectiveTransmissionCoeff_0;

    if(_S53)
    {

        effectiveTransmissionCoeff_0 = (vec3(1.0) - thinFilmDielectricFresnel_0(closure_11, _S54, regularReflect_1, 1.0)) * weightedTransmissionColor_1(closure_11);

    }
    else
    {

        effectiveTransmissionCoeff_0 = transmissionCoeff_3;

    }



    return effectiveTransmissionCoeff_0 * d_0 * g_0 * factor_0;
}


vec3 dispersionIors_0(SurfaceClosure_0 closure_12)
{

    float _S55 = max(closure_12.ior_2, 1.0);

    float scale_0 = (_S55 - 1.0) * max(closure_12.dispersion_2, 0.0) * 0.05000000074505806;



    return max(vec3(_S55 + scale_0 * -0.30094969272613525, _S55, _S55 + scale_0 * 0.69905030727386475), vec3(1.0));
}


vec3 evaluateThickTransmissionScatteringDispersed_0(SurfaceClosure_0 closure_13, vec3 transmissionCoeff_4, vec3 normal_6, vec3 viewDir_5, vec3 lightDir_5, float iorI_4, float iorO_4, bool insideMedium_0)
{

    bool _S56;
    if((closure_13.dispersion_2) <= 0.00000999999974738)
    {

        _S56 = true;

    }
    else
    {

        _S56 = (closure_13.thinWalled_1) > 0.5;

    }

    if(_S56)
    {

        return evaluateThickTransmissionScattering_0(closure_13, transmissionCoeff_4, normal_6, viewDir_5, lightDir_5, iorI_4, iorO_4);
    }

    vec3 iors_0 = dispersionIors_0(closure_13);


    vec3 _S57 = vec3(transmissionCoeff_4.x, 0.0, 0.0);

    float _S58;



    if(insideMedium_0)
    {

        _S58 = iors_0.x;

    }
    else
    {

        _S58 = 1.0;

    }

    float _S59;
    if(insideMedium_0)
    {

        _S59 = 1.0;

    }
    else
    {

        _S59 = iors_0.x;

    }

    vec3 red_0 = evaluateThickTransmissionScattering_0(closure_13, _S57, normal_6, viewDir_5, lightDir_5, _S58, _S59);

    vec3 _S60 = vec3(0.0, transmissionCoeff_4.y, 0.0);



    if(insideMedium_0)
    {

        _S58 = iors_0.y;

    }
    else
    {

        _S58 = 1.0;

    }
    if(insideMedium_0)
    {

        _S59 = 1.0;

    }
    else
    {

        _S59 = iors_0.y;

    }

    vec3 green_0 = evaluateThickTransmissionScattering_0(closure_13, _S60, normal_6, viewDir_5, lightDir_5, _S58, _S59);

    vec3 _S61 = vec3(0.0, 0.0, transmissionCoeff_4.z);



    if(insideMedium_0)
    {

        _S58 = iors_0.z;

    }
    else
    {

        _S58 = 1.0;

    }
    if(insideMedium_0)
    {

        _S59 = 1.0;

    }
    else
    {

        _S59 = iors_0.z;

    }
    return vec3(red_0.x, green_0.y, evaluateThickTransmissionScattering_0(closure_13, _S61, normal_6, viewDir_5, lightDir_5, _S58, _S59).z);
}


vec3 evalDielectricTransmission_0(SurfaceClosure_0 closure_14, float currentMediumIor_3, vec3 normal_7, vec3 viewDir_6, vec3 lightDir_6)
{

    float _S62 = max(currentMediumIor_3, 1.0);

    bool insideMedium_1;
    if(_S62 > 1.00010001659393311)
    {

        insideMedium_1 = (closure_14.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_1 = false;

    }

    float iorI_5;
    if(insideMedium_1)
    {

        iorI_5 = _S62;

    }
    else
    {

        iorI_5 = 1.0;

    }

    float iorO_5;
    if(insideMedium_1)
    {

        iorO_5 = 1.0;

    }
    else
    {

        iorO_5 = closure_14.ior_2;

    }

    if((dot(normal_7, viewDir_6) * dot(normal_7, lightDir_6)) > 0.0)
    {

        return evaluateDielectricSpecularGGX_0(closure_14, normal_7, viewDir_6, lightDir_6, iorI_5, iorO_5);
    }

    DielectricTransmissionCoefficients_0 coeffs_1 = computeDielectricTransmissionCoefficients_0(closure_14, currentMediumIor_3, normal_7, viewDir_6, iorI_5, iorO_5);

    vec3 _S63;

    if((closure_14.thinWalled_1) > 0.5)
    {

        _S63 = evaluateThinTransmissionScattering_0(closure_14, normal_7, viewDir_6, lightDir_6, iorI_5, iorO_5);

    }
    else
    {

        _S63 = evaluateThickTransmissionScatteringDispersed_0(closure_14, coeffs_1.transmissionCoeff_1, normal_7, viewDir_6, lightDir_6, iorI_5, iorO_5, insideMedium_1);

    }

    return _S63;
}


float directionalAlbedoGGXMs_0(float theta_3, float alpha_19, float e0_6)
{

    return directionalAlbedoGGXMsGeneric_0(theta_3, alpha_19, e0_6);
}

float averageAlbedoGGXMs_0(float alpha_20, float e0_7)
{

    return averageAlbedoGGXMsGeneric_0(alpha_20, e0_7);
}


float coupledDiffuseFactor_0(SurfaceClosure_0 closure_15, float noV_3, float noL_2)
{

    float _S64 = closure_15.roughness_3;
    float _S65 = max(_S64 * _S64, 0.0);
    float e0_8 = max3_0(closure_15.dielectricSpecularColor_0 * closure_15.dielectricWeight_0);

    return mix(0.31830987334251404, (1.0 - directionalAlbedoGGXMs_0(noL_2, _S65, e0_8)) * (1.0 - directionalAlbedoGGXMs_0(noV_3, _S65, e0_8)) / max(3.14159274101257324 * (1.0 - averageAlbedoGGXMs_0(_S65, e0_8)), 9.99999997475242708e-07), closure_15.specular_1);
}


vec3 thinSharedSpecularColor_0(SurfaceClosure_0 closure_16)
{

    return closure_16.dielectricSpecularColor_0 * closure_16.dielectricWeight_0 + closure_16.specularColor_1 * closure_16.metallic_1;
}

vec3 thinSharedSpecularF90_0(SurfaceClosure_0 closure_17)
{

    return closure_17.dielectricSpecularF90_0 * closure_17.dielectricWeight_0 + vec3(closure_17.metallic_1);
}


vec3 closureDiffuseEnergy_0(SurfaceClosure_0 closure_18)
{


    const vec3 _S66 = vec3(1.0);

    return clamp(_S66 - (fresnelSchlickAverage_0(closure_18.specularColor_1, closure_18.specularF90_0) * closure_18.metallic_1 + fresnelSchlickAverage_0(closure_18.dielectricSpecularColor_0, closure_18.dielectricSpecularF90_0) * closure_18.dielectricWeight_0), vec3(0.0), _S66);
}


float transmissiveDiffuseCompensationFactor_0(SurfaceClosure_0 closure_19, float noV_4, float noL_3)
{

    float coupled_0 = coupledDiffuseFactor_0(closure_19, noV_4, noL_3);
    bool _S67 = (closure_19.thinWalled_1) > 0.5;

    vec3 sharedSpecularColor_0;

    if(_S67)
    {

        sharedSpecularColor_0 = thinSharedSpecularColor_0(closure_19);

    }
    else
    {

        sharedSpecularColor_0 = closure_19.dielectricSpecularColor_0;

    }

    vec3 sharedSpecularF90_0;
    if(_S67)
    {

        sharedSpecularF90_0 = thinSharedSpecularF90_0(closure_19);

    }
    else
    {

        sharedSpecularF90_0 = closure_19.dielectricSpecularF90_0;

    }
    float sharedF0_0 = max3_0(sharedSpecularColor_0);

    float _S68 = max3_0(sharedSpecularF90_0) - sharedF0_0;

    return coupled_0 * mix(1.0, 1.0 / max(max3_0(closureDiffuseEnergy_0(closure_19)), 0.00009999999747379), sqrt(0.5 * (clamp(sharedF0_0 + _S68 * pow(1.0 - clamp(noV_4, 0.0, 1.0), 5.0), 0.0, 1.0) + clamp(sharedF0_0 + _S68 * pow(1.0 - clamp(noL_3, 0.0, 1.0), 5.0), 0.0, 1.0))));
}


vec3 evalDiffuseReflection_0(SurfaceClosure_0 closure_20, vec3 normal_8, vec3 viewDir_7, vec3 lightDir_7)
{

    float _S69 = max(dot(normal_8, lightDir_7), 0.0);

    bool _S70;
    if((closure_20.specular_1) <= 0.00000999999974738)
    {

        _S70 = (closure_20.transparency_1) <= 0.0;

    }
    else
    {

        _S70 = false;

    }

    if(_S70)
    {

        return closure_20.diffuseReflectionColor_0 * 0.31830987334251404 * _S69;
    }
    float _S71 = max(abs(dot(viewDir_7, normal_8)), 0.0);

    float factor_1;

    if((closure_20.transparency_1) > 0.0)
    {

        factor_1 = transmissiveDiffuseCompensationFactor_0(closure_20, _S71, _S69);

    }
    else
    {

        factor_1 = coupledDiffuseFactor_0(closure_20, _S71, _S69);

    }

    return closure_20.diffuseReflectionColor_0 * factor_1 * _S69;
}


bool isThinTransmissiveDielectric_0(SurfaceClosure_0 closure_21)
{

    bool _S72;

    if((closure_21.thinWalled_1) > 0.5)
    {

        if((closure_21.transparency_1) > 0.0)
        {

            _S72 = true;

        }
        else
        {

            _S72 = (closure_21.diffuseTransmissionWeight_0) > 0.0;

        }

    }
    else
    {

        _S72 = false;

    }
    if(_S72)
    {

        _S72 = (closure_21.metallic_1) < 1.0;

    }
    else
    {

        _S72 = false;

    }

    return _S72;
}


vec3 evaluateThinSharedSpecularGGX_0(SurfaceClosure_0 closure_22, vec3 normal_9, vec3 viewDir_8, vec3 lightDir_8)
{

    float _S73 = max(dot(normal_9, lightDir_8), 0.0);
    if(_S73 <= 0.0)
    {

        return vec3(0.0);
    }
    vec3 microfacetResponse_1 = evaluateMicrofacetResponseAnisotropic_0(closure_22.roughness_3, closure_22.anisotropy_1, normal_9, closure_22.anisotropyTangent_1, viewDir_8, lightDir_8);

    float _S74 = max(dot(viewDir_8, normalize(viewDir_8 + lightDir_8)), 0.0);
    float _S75 = max(closure_22.roughness_3 * closure_22.roughness_3, 0.0);



    float eAvg_1 = averageAlbedoGGX_0(_S75);
    float _S76 = 1.0 - eAvg_1;

    float ms_1 = (1.0 - directionalAlbedoGGX_0(_S75, _S73)) * (1.0 - directionalAlbedoGGX_0(_S75, abs(dot(normal_9, viewDir_8)))) / max(3.14159274101257324 * _S76, 9.99999997475242708e-07);
    vec3 f0_5 = thinSharedSpecularColor_0(closure_22);
    vec3 f90_4 = thinSharedSpecularF90_0(closure_22);
    vec3 f_1 = fresnelSchlick_0(f0_5, f90_4, _S74);

    vec3 f_2;
    if((closure_22.iridescence_2) > 0.00000999999974738)
    {

        f_2 = thinFilmMixFresnel_0(f_1, thinFilmReflectance_0(1.0, closure_22.iridescenceIor_2, thinFilmDielectricSubstrateF0_0(closure_22.ior_2, 1.0), closure_22.iridescenceThickness_2, _S74), closure_22.iridescence_2);

    }
    else
    {

        f_2 = f_1;

    }

    vec3 fAvg_1 = fresnelSchlickAverage_0(f0_5, f90_4);

    return (microfacetResponse_1 * f_2 + ms_1 * (fAvg_1 * fAvg_1 * eAvg_1 / max(vec3(1.0) - fAvg_1 * _S76, vec3(0.00000999999974738)))) * _S73;
}


vec3 evaluateBaseSpecularGGX_0(SurfaceClosure_0 closure_23, vec3 normal_10, vec3 viewDir_9, vec3 lightDir_9)
{



    vec3 microfacetResponse_2 = evaluateMicrofacetResponseAnisotropic_0(closure_23.roughness_3, closure_23.anisotropy_1, normal_10, closure_23.anisotropyTangent_1, viewDir_9, lightDir_9);

    float _S77 = max(dot(viewDir_9, normalize(viewDir_9 + lightDir_9)), 0.0);
    float _S78 = max(closure_23.roughness_3 * closure_23.roughness_3, 0.0);

    float eAvg_2 = averageAlbedoGGX_0(_S78);
    float _S79 = 1.0 - eAvg_2;

    float ms_2 = (1.0 - directionalAlbedoGGX_0(_S78, abs(dot(normal_10, lightDir_9)))) * (1.0 - directionalAlbedoGGX_0(_S78, abs(dot(normal_10, viewDir_9)))) / max(3.14159274101257324 * _S79, 9.99999997475242708e-07);
    vec3 metalF_0 = fresnelSchlick_0(closure_23.specularColor_1, closure_23.specularF90_0, _S77);
    bool _S80 = (closure_23.iridescence_2) > 0.00000999999974738;

    vec3 metalF_1;

    if(_S80)
    {

        metalF_1 = thinFilmMixFresnel_0(metalF_0, thinFilmReflectance_0(1.0, closure_23.iridescenceIor_2, closure_23.specularColor_1, closure_23.iridescenceThickness_2, _S77), closure_23.iridescence_2);

    }
    else
    {

        metalF_1 = metalF_0;

    }

    vec3 metalSingleScatter_0 = microfacetResponse_2 * metalF_1;
    vec3 metalFAvg_0 = fresnelSchlickAverage_0(closure_23.specularColor_1, closure_23.specularF90_0);
    const vec3 _S81 = vec3(1.0);

    const vec3 _S82 = vec3(0.00000999999974738);

    vec3 metalMultiScatter_0 = ms_2 * (metalFAvg_0 * metalFAvg_0 * eAvg_2 / max(_S81 - metalFAvg_0 * _S79, _S82));
    vec3 dielectricF_0 = fresnelSchlick_0(closure_23.dielectricSpecularColor_0, closure_23.dielectricSpecularF90_0, _S77);

    vec3 dielectricF_1;
    if(_S80)
    {

        dielectricF_1 = thinFilmMixFresnel_0(dielectricF_0, thinFilmReflectance_0(1.0, closure_23.iridescenceIor_2, thinFilmDielectricSubstrateF0_0(closure_23.ior_2, 1.0), closure_23.iridescenceThickness_2, _S77), closure_23.iridescence_2);

    }
    else
    {

        dielectricF_1 = dielectricF_0;

    }

    vec3 dielectricFAvg_0 = fresnelSchlickAverage_0(closure_23.dielectricSpecularColor_0, closure_23.dielectricSpecularF90_0);


    return closure_23.metallic_1 * (metalSingleScatter_0 + metalMultiScatter_0) + closure_23.dielectricWeight_0 * (1.0 - closure_23.transparency_1) * (microfacetResponse_2 * dielectricF_1 + ms_2 * (dielectricFAvg_0 * dielectricFAvg_0 * eAvg_2 / max(_S81 - dielectricFAvg_0 * _S79, _S82)));
}


vec3 evalBaseSpecular_0(SurfaceClosure_0 closure_24, vec3 normal_11, vec3 viewDir_10, vec3 lightDir_10)
{

    float _S83 = max(dot(normal_11, lightDir_10), 0.0);
    if(isThinTransmissiveDielectric_0(closure_24))
    {

        return evaluateThinSharedSpecularGGX_0(closure_24, normal_11, viewDir_10, lightDir_10);
    }
    return evaluateBaseSpecularGGX_0(closure_24, normal_11, viewDir_10, lightDir_10) * _S83;
}


float sheenAlpha_0(float roughness_6)
{

    return max(roughness_6 * roughness_6, 0.0);
}


float sheenLogApprox_0(float x_0, float alpha_21)
{

    float _S84 = 1.0 - alpha_21;

    float oneMinusAlphaSq_0 = _S84 * _S84;

    return mix(21.54730033874511719, 25.32449913024902344, oneMinusAlphaSq_0) / (1.0 + mix(3.82986998558044434, 3.32435011863708496, oneMinusAlphaSq_0) * pow(abs(x_0), mix(0.19822999835014343, 0.16800999641418457, oneMinusAlphaSq_0))) + mix(-1.97759997844696045, -1.27392995357513428, oneMinusAlphaSq_0) * x_0 + mix(-4.32053995132446289, -4.85967016220092773, oneMinusAlphaSq_0);
}

float lambdaSheen_0(float cosTheta_8, float alpha_22)
{

    float _S85;

    if((abs(cosTheta_8)) >= 0.5)
    {

        _S85 = exp(2.0 * sheenLogApprox_0(0.5, alpha_22) - sheenLogApprox_0(1.0 - cosTheta_8, alpha_22));

    }
    else
    {

        _S85 = exp(sheenLogApprox_0(cosTheta_8, alpha_22));

    }

    return _S85;
}


vec3 evalSheen_0(SurfaceClosure_0 closure_25, vec3 normal_12, vec3 viewDir_11, vec3 lightDir_11)
{

    if((max3_0(closure_25.sheenColor_1)) <= 0.0)
    {

        return vec3(0.0);
    }

    float _S86 = max(dot(normal_12, viewDir_11), 0.0);
    float _S87 = max(dot(normal_12, lightDir_11), 0.0);
    float _S88 = max(dot(normal_12, normalize(viewDir_11 + lightDir_11)), 0.0);

    bool _S89;
    if(_S86 <= 0.0)
    {

        _S89 = true;

    }
    else
    {

        _S89 = _S87 <= 0.0;

    }

    if(_S89)
    {

        _S89 = true;

    }
    else
    {

        _S89 = _S88 <= 0.0;

    }

    if(_S89)
    {

        return vec3(0.0);
    }

    float alpha_23 = sheenAlpha_0(closure_25.sheenRoughness_1);
    float invAlpha_0 = 1.0 / max(alpha_23, 0.00000999999974738);



    return closure_25.sheenColor_1 * (1.0 / (1.0 + lambdaSheen_0(_S86, alpha_23) + lambdaSheen_0(_S87, alpha_23)) * ((2.0 + invAlpha_0) * pow(abs(max(1.0 - _S88 * _S88, 0.00100000004749745)), 0.5 * invAlpha_0) / 6.28318548202514648) / max(4.0 * _S86 * _S87, 0.00000999999974738)) * _S87;
}


vec3 evaluateReflectedBaseScattering_0(MaterialBsdfState_0 state_1, vec3 baseNormal_1, vec3 viewDir_12, vec3 lightDir_12)
{

    return evalDiffuseReflection_0(state_1.closure_1, baseNormal_1, viewDir_12, lightDir_12) + evalBaseSpecular_0(state_1.closure_1, baseNormal_1, viewDir_12, lightDir_12) + evalSheen_0(state_1.closure_1, baseNormal_1, viewDir_12, lightDir_12);
}


float ggxDistribution_0(float alpha_24, float noH_1)
{

    float a2_0 = alpha_24 * alpha_24;
    float d_1 = noH_1 * noH_1 * (a2_0 - 1.0) + 1.0;
    return a2_0 / max(3.14159274101257324 * d_1 * d_1, 9.999999960041972e-13);
}


float ggxSmithLambda_0(float alpha_25, float noX_0)
{

    float cosTheta_9 = abs(noX_0);
    float _S90 = cosTheta_9 * cosTheta_9;

    float _S91 = max(1.0 - _S90, 0.0);

    bool _S92;
    if(_S91 <= 9.99999993922529029e-09)
    {

        _S92 = true;

    }
    else
    {

        _S92 = cosTheta_9 <= 9.99999993922529029e-09;

    }

    if(_S92)
    {

        return 0.0;
    }

    return 0.5 * (-1.0 + sqrt(1.0 + alpha_25 * alpha_25 * (_S91 / max(_S90, 9.99999993922529029e-09))));
}

float ggxSmithG2_0(float alpha_26, float noV_5, float noL_4)
{

    return 1.0 / (1.0 + ggxSmithLambda_0(alpha_26, noV_5) + ggxSmithLambda_0(alpha_26, noL_4));
}


vec3 evaluateMicrofacetGGX_0(vec3 specularColor_2, vec3 specularF90_1, float roughness_7, vec3 normal_13, vec3 viewDir_13, vec3 lightDir_13)
{

    vec3 halfVec_2 = normalize(viewDir_13 + lightDir_13);
    float _S93 = max(dot(normal_13, viewDir_13), 0.0);
    float _S94 = max(dot(normal_13, lightDir_13), 0.0);
    float _S95 = max(dot(normal_13, halfVec_2), 0.0);
    float _S96 = max(dot(viewDir_13, halfVec_2), 0.0);

    bool _S97;
    if(_S93 <= 0.0)
    {

        _S97 = true;

    }
    else
    {

        _S97 = _S94 <= 0.0;

    }

    if(_S97)
    {

        _S97 = true;

    }
    else
    {

        _S97 = _S95 <= 0.0;

    }

    if(_S97)
    {

        _S97 = true;

    }
    else
    {

        _S97 = _S96 <= 0.0;

    }

    if(_S97)
    {

        return vec3(0.0);
    }

    float _S98 = max(roughness_7 * roughness_7, 0.0);



    return fresnelSchlick_0(specularColor_2, specularF90_1, _S96) * ggxDistribution_0(_S98, _S95) * ggxSmithG2_0(_S98, _S93, _S94) / max(4.0 * _S93 * _S94, 0.00000999999974738);
}


vec3 evaluateClearcoatGGX_0(SurfaceClosure_0 closure_26, vec3 normal_14, vec3 viewDir_14, vec3 lightDir_14)
{

    if((closure_26.clearcoat_2) <= 0.0)
    {

        return vec3(0.0);
    }
    return closure_26.clearcoat_2 * evaluateMicrofacetGGX_0(vec3(0.03999999910593033), vec3(1.0), closure_26.clearcoatRoughness_1, normal_14, viewDir_14, lightDir_14);
}


vec3 evalClearcoat_0(SurfaceClosure_0 closure_27, vec3 normal_15, vec3 viewDir_15, vec3 lightDir_15)
{
    return evaluateClearcoatGGX_0(closure_27, normal_15, viewDir_15, lightDir_15) * max(dot(normal_15, lightDir_15), 0.0);
}


float clearcoatBaseWeight_0(SurfaceClosure_0 closure_28, vec3 clearcoatNormal_0, vec3 viewDir_16, vec3 lightDir_16)
{

    if((closure_28.clearcoat_2) <= 0.0)
    {

        return 1.0;
    }


    const vec3 _S99 = vec3(0.03999999910593033);

    const vec3 _S100 = vec3(1.0);

    return clamp(1.0 - closure_28.clearcoat_2 * max(max3_0(fresnelSchlick_0(_S99, _S100, abs(dot(clearcoatNormal_0, viewDir_16)))), max3_0(fresnelSchlick_0(_S99, _S100, abs(dot(clearcoatNormal_0, lightDir_16))))), 0.0, 1.0);
}


vec3 evalMaterialBsdfMixture_0(MaterialBsdfState_0 state_2, vec3 baseNormal_2, vec3 clearcoatNormal_1, vec3 viewDir_17, vec3 lightDir_17)
{

    if(!((dot(baseNormal_2, viewDir_17) * dot(baseNormal_2, lightDir_17)) > 0.0))
    {

        return evalDiffuseTransmission_0(state_2.closure_1, baseNormal_2, lightDir_17) + evalDielectricTransmission_0(state_2.closure_1, state_2.currentMediumIor_0, baseNormal_2, viewDir_17, lightDir_17);
    }


    vec3 base_1 = evaluateReflectedBaseScattering_0(state_2, baseNormal_2, viewDir_17, lightDir_17);

    bool _S101;
    if((state_2.closure_1.thinWalled_1) < 0.5)
    {

        _S101 = (state_2.closure_1.transparency_1) > 0.0;

    }
    else
    {

        _S101 = false;

    }

    vec3 base_2;

    if(_S101)
    {

        base_2 = base_1 + evalDielectricTransmission_0(state_2.closure_1, state_2.currentMediumIor_0, baseNormal_2, viewDir_17, lightDir_17);

    }
    else
    {

        base_2 = base_1;

    }



    return evalClearcoat_0(state_2.closure_1, clearcoatNormal_1, viewDir_17, lightDir_17) + base_2 * clearcoatBaseWeight_0(state_2.closure_1, clearcoatNormal_1, viewDir_17, lightDir_17);
}


struct DirectionContext_0
{
    vec3 viewDir_18;
    vec3 lightDir_18;
};


struct NormalContext_0
{
    vec3 rawGeometryNormal_0;
    vec3 transmissionNormal_0;
    vec3 baseNormal_3;
    vec3 clearcoatNormal_2;
};


vec3 evalMaterialBsdf_0(MaterialBsdfState_0 state_3, DirectionContext_0 directions_0, NormalContext_0 normals_1)
{

    return evalMaterialBsdfMixture_0(state_3, normals_1.baseNormal_3, normals_1.clearcoatNormal_2, directions_0.viewDir_18, directions_0.lightDir_18);
}


vec3 evalPbrBsdf_0(MaterialBsdfState_0 state_4, DirectionContext_0 directions_1, NormalContext_0 normals_2)
{
    return evalMaterialBsdf_0(state_4, directions_1, normals_2);
}


float thinInterfaceBaseProbability_0(SurfaceClosure_0 closure_29, float currentMediumIor_4, vec3 baseNormal_4, vec3 viewDir_19)
{

    return clamp(1.0 - max3_0(fresnelSchlick_0(thinSharedSpecularColor_0(closure_29), thinSharedSpecularF90_0(closure_29), max(abs(dot(baseNormal_4, viewDir_19)), 0.00000999999974738))), 0.0, 1.0);
}


float transmissiveBaseLayerWeight_0(SurfaceClosure_0 closure_30)
{

    return max(closure_30.diffuseWeight_0 + closure_30.sheenWeight_0 + closure_30.diffuseTransmissionWeight_0 + closure_30.transmissionWeight_0, 0.00000999999974738);
}


float pdfDiffuseTransmission_0(vec3 normal_16, vec3 lightDir_19)
{

    return max(dot(- normal_16, lightDir_19), 0.0) * 0.31830987334251404;
}


float sampleSpecularLobePdf_0(SurfaceClosure_0 closure_31, vec3 normal_17, vec3 viewDir_20, vec3 dir_1)
{

    vec3 halfVec_3 = normalize(viewDir_20 + dir_1);
    vec3 localHalf_2 = projectToAnisotropicFrame_0(normal_17, closure_31.anisotropyTangent_1, halfVec_3);
    float noH_2 = abs(localHalf_2.z);
    float _S102 = max(dot(viewDir_20, halfVec_3), 0.0);

    bool _S103;
    if(noH_2 <= 0.0)
    {

        _S103 = true;

    }
    else
    {

        _S103 = _S102 <= 0.0;

    }

    if(_S103)
    {

        return 0.0;
    }



    return ggxDistributionAnisotropic_0(anisotropicAlpha_0(closure_31.roughness_3, closure_31.anisotropy_1), localHalf_2) * noH_2 / max(4.0 * _S102, 0.00000999999974738);
}


float ggxSmithG1Anisotropic_0(vec2 alpha_27, vec3 localDir_1)
{

    return 1.0 / (1.0 + ggxSmithLambdaAnisotropic_0(alpha_27, localDir_1));
}


float evaluateThickTransmissionPdf_0(SurfaceClosure_0 closure_32, vec3 normal_18, vec3 viewDir_21, vec3 lightDir_20, float iorI_6, float iorO_6)
{

    vec3 localView_3 = projectToAnisotropicFrame_0(normal_18, closure_32.anisotropyTangent_1, viewDir_21);

    float noV_6 = abs(localView_3.z);
    float noL_5 = abs(projectToAnisotropicFrame_0(normal_18, closure_32.anisotropyTangent_1, lightDir_20).z);

    bool _S104;
    if(noV_6 <= 0.00000999999974738)
    {

        _S104 = true;

    }
    else
    {

        _S104 = noL_5 <= 0.00000999999974738;

    }

    if(_S104)
    {

        _S104 = true;

    }
    else
    {

        _S104 = (dot(normal_18, viewDir_21) * dot(normal_18, lightDir_20)) >= 0.0;

    }

    if(_S104)
    {

        return 0.0;
    }

    float etaRatio_1 = iorO_6 / max(iorI_6, 0.00000999999974738);
    vec3 halfVec_4 = - normalize(viewDir_21 + lightDir_20 * etaRatio_1);
    vec3 localHalf_3 = projectToAnisotropicFrame_0(normal_18, closure_32.anisotropyTangent_1, halfVec_4);

    float voH_1 = dot(viewDir_21, halfVec_4);
    float loH_1 = dot(lightDir_20, halfVec_4);
    if((abs(localHalf_3.z)) <= 0.00000999999974738)
    {

        _S104 = true;

    }
    else
    {

        _S104 = (voH_1 * loH_1) >= 0.0;

    }

    if(_S104)
    {

        return 0.0;
    }

    vec2 alpha_28 = anisotropicAlpha_0(closure_32.roughness_3, closure_32.anisotropy_1);

    return ggxDistributionAnisotropic_0(alpha_28, localHalf_3) * ggxSmithG1Anisotropic_0(alpha_28, localView_3) * (etaRatio_1 * etaRatio_1 * abs(voH_1) * abs(loH_1) / max(pow(voH_1 + etaRatio_1 * loH_1, 2.0) * noV_6, 0.00000999999974738));
}


float pdfDielectricTransmission_0(SurfaceClosure_0 closure_33, float currentMediumIor_5, vec3 normal_19, vec3 viewDir_22, vec3 lightDir_21)
{

    float _S105 = max(currentMediumIor_5, 1.0);

    bool insideMedium_2;
    if(_S105 > 1.00010001659393311)
    {

        insideMedium_2 = (closure_33.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_2 = false;

    }

    float iorI_7;
    if(insideMedium_2)
    {

        iorI_7 = _S105;

    }
    else
    {

        iorI_7 = 1.0;

    }

    float iorO_7;
    if(insideMedium_2)
    {

        iorO_7 = 1.0;

    }
    else
    {

        iorO_7 = closure_33.ior_2;

    }
    DielectricTransmissionCoefficients_0 coeffs_2 = computeDielectricTransmissionCoefficients_0(closure_33, currentMediumIor_5, normal_19, viewDir_22, iorI_7, iorO_7);

    if((dot(normal_19, viewDir_22) * dot(normal_19, lightDir_21)) < 0.0)
    {

        float _S106 = max(coeffs_2.transmissionProb_0, 0.00000999999974738);

        float lobePdf_0;

        if((closure_33.thinWalled_1) > 0.5)
        {

            lobePdf_0 = sampleSpecularLobePdf_0(closure_33, normal_19, viewDir_22, flipAcrossNormal_0(lightDir_21, normal_19));

        }
        else
        {

            lobePdf_0 = evaluateThickTransmissionPdf_0(closure_33, normal_19, viewDir_22, lightDir_21, iorI_7, iorO_7);

        }

        return max(_S106 * lobePdf_0, 0.00000999999974738);
    }


    return max(clamp(coeffs_2.reflectionProb_0, 0.0, 1.0) * sampleSpecularLobePdf_0(closure_33, normal_19, viewDir_22, lightDir_21), 0.00000999999974738);
}


float pdfDiffuseReflection_0(vec3 normal_20, vec3 lightDir_22)
{

    return max(dot(normal_20, lightDir_22), 0.0) * 0.31830987334251404;
}


float pdfSheen_0(vec3 normal_21, vec3 lightDir_23)
{

    return max(dot(normal_21, lightDir_23), 0.0) * 0.31830987334251404;
}


float pdfBaseSpecular_0(SurfaceClosure_0 closure_34, vec3 normal_22, vec3 viewDir_23, vec3 lightDir_24)
{

    return sampleSpecularLobePdf_0(closure_34, normal_22, viewDir_23, lightDir_24);
}


float sampleSpecularLobePdfIsotropic_0(vec3 normal_23, vec3 viewDir_24, float roughness_8, vec3 dir_2)
{

    vec3 halfVec_5 = normalize(viewDir_24 + dir_2);
    float _S107 = max(dot(normal_23, halfVec_5), 0.0);
    float _S108 = max(dot(viewDir_24, halfVec_5), 0.0);

    bool _S109;
    if(_S107 <= 0.0)
    {

        _S109 = true;

    }
    else
    {

        _S109 = _S108 <= 0.0;

    }

    if(_S109)
    {

        return 0.0;
    }



    return ggxDistribution_0(max(roughness_8 * roughness_8, 0.0), _S107) * _S107 / max(4.0 * _S108, 0.00000999999974738);
}


float pdfClearcoat_0(SurfaceClosure_0 closure_35, vec3 normal_24, vec3 viewDir_25, vec3 lightDir_25)
{

    float _S110;

    if((max(dot(normal_24, lightDir_25), 0.0)) > 0.0)
    {

        _S110 = sampleSpecularLobePdfIsotropic_0(normal_24, viewDir_25, closure_35.clearcoatRoughness_1, lightDir_25);

    }
    else
    {

        _S110 = 0.0;

    }

    return _S110;
}


float dielectricViewFresnelMax_0(SurfaceClosure_0 closure_36, vec3 baseNormal_5, vec3 viewDir_26)
{
    return max3_0(fresnelSchlick_0(closure_36.dielectricSpecularColor_0, closure_36.dielectricSpecularF90_0, max(dot(baseNormal_5, viewDir_26), 0.0)));
}


float pdfMaterialBsdfMixture_0(MaterialBsdfState_0 state_5, vec3 baseNormal_6, vec3 clearcoatNormal_3, vec3 viewDir_27, vec3 dir_3)
{

    float _S111 = dot(baseNormal_6, dir_3);

    float _S112 = max(_S111, 0.0);
    float _S113 = max(dot(clearcoatNormal_3, dir_3), 0.0);
    bool transmissionSide_0 = (dot(baseNormal_6, viewDir_27) * _S111) < 0.0;
    bool thinDielectric_0 = isThinTransmissiveDielectric_0(state_5.closure_1);

    float thinBaseProb_0;
    if(thinDielectric_0)
    {

        thinBaseProb_0 = thinInterfaceBaseProbability_0(state_5.closure_1, state_5.currentMediumIor_0, baseNormal_6, viewDir_27);

    }
    else
    {

        thinBaseProb_0 = 0.0;

    }

    float thinSpecularProb_0;
    if(thinDielectric_0)
    {

        thinSpecularProb_0 = 1.0 - thinBaseProb_0;

    }
    else
    {

        thinSpecularProb_0 = 0.0;

    }

    float pdf_0;
    if(transmissionSide_0)
    {

        if(thinDielectric_0)
        {

            float baseLayerWeight_0 = transmissiveBaseLayerWeight_0(state_5.closure_1);

            if((state_5.closure_1.diffuseTransmissionWeight_0) > 0.0)
            {

                pdf_0 = thinBaseProb_0 * (state_5.closure_1.diffuseTransmissionWeight_0 / baseLayerWeight_0) * pdfDiffuseTransmission_0(baseNormal_6, dir_3);

            }
            else
            {

                pdf_0 = 0.0;

            }



            if((state_5.closure_1.transmissionWeight_0) > 0.0)
            {

                pdf_0 = pdf_0 + thinBaseProb_0 * (state_5.closure_1.transmissionWeight_0 / baseLayerWeight_0) * sampleSpecularLobePdf_0(state_5.closure_1, baseNormal_6, viewDir_27, flipAcrossNormal_0(dir_3, baseNormal_6));

            }



            if(pdf_0 > 0.0)
            {

                thinBaseProb_0 = max(pdf_0, 0.00000999999974738);

            }
            else
            {

                thinBaseProb_0 = 0.0;

            }

            return thinBaseProb_0;
        }

        float _S114 = max(state_5.closure_1.diffuseTransmissionWeight_0 + state_5.closure_1.transmissionWeight_0, 0.00000999999974738);

        if((state_5.closure_1.diffuseTransmissionWeight_0) > 0.0)
        {

            pdf_0 = state_5.closure_1.diffuseTransmissionWeight_0 / _S114 * pdfDiffuseTransmission_0(baseNormal_6, dir_3);

        }
        else
        {

            pdf_0 = 0.0;

        }


        if((state_5.closure_1.transmissionWeight_0) > 0.0)
        {

            pdf_0 = pdf_0 + state_5.closure_1.transmissionWeight_0 / _S114 * pdfDielectricTransmission_0(state_5.closure_1, state_5.currentMediumIor_0, baseNormal_6, viewDir_27, dir_3);

        }



        if(pdf_0 > 0.0)
        {

            thinBaseProb_0 = max(pdf_0, 0.00000999999974738);

        }
        else
        {

            thinBaseProb_0 = 0.0;

        }

        return thinBaseProb_0;
    }

    if(_S112 <= 0.0)
    {

        return 0.0;
    }

    if(thinDielectric_0)
    {

        float baseLayerWeight_1 = transmissiveBaseLayerWeight_0(state_5.closure_1);
        float _S115 = max(thinBaseProb_0 + thinSpecularProb_0 + state_5.closure_1.clearcoatWeight_0, 0.00000999999974738);
        float diffusePdf_0 = thinBaseProb_0 * state_5.closure_1.diffuseWeight_0 / baseLayerWeight_1 / _S115 * pdfDiffuseReflection_0(baseNormal_6, dir_3);

        float sheenPdf_0 = thinBaseProb_0 * state_5.closure_1.sheenWeight_0 / baseLayerWeight_1 / _S115 * pdfSheen_0(baseNormal_6, dir_3);

        float specularPdf_0 = thinSpecularProb_0 / _S115 * pdfBaseSpecular_0(state_5.closure_1, baseNormal_6, viewDir_27, dir_3);

        float _S116 = state_5.closure_1.clearcoatWeight_0 / _S115;
        if(_S113 > 0.0)
        {

            thinBaseProb_0 = pdfClearcoat_0(state_5.closure_1, clearcoatNormal_3, viewDir_27, dir_3);

        }
        else
        {

            thinBaseProb_0 = 0.0;

        }
        return max(diffusePdf_0 + sheenPdf_0 + specularPdf_0 + _S116 * thinBaseProb_0, 0.00000999999974738);
    }

    float dielectricViewFresnel_0 = dielectricViewFresnelMax_0(state_5.closure_1, baseNormal_6, viewDir_27);
    float _S117 = 1.0 - dielectricViewFresnel_0;

    float diffuseProbWeight_0 = state_5.closure_1.diffuseWeight_0 * _S117;
    float sheenProbWeight_0 = state_5.closure_1.sheenWeight_0 * _S117;

    float specularProbWeight_0 = state_5.closure_1.specularWeight_0 + state_5.closure_1.dielectricWeight_0 * (1.0 - state_5.closure_1.transparency_1) * dielectricViewFresnel_0;
    float _S118 = max(diffuseProbWeight_0 + sheenProbWeight_0 + state_5.closure_1.diffuseTransmissionWeight_0 + specularProbWeight_0 + state_5.closure_1.transmissionWeight_0 + state_5.closure_1.clearcoatWeight_0, 0.00000999999974738);

    float diffusePdf_1 = diffuseProbWeight_0 / _S118 * pdfDiffuseReflection_0(baseNormal_6, dir_3);
    float sheenPdf_1 = sheenProbWeight_0 / _S118 * pdfSheen_0(baseNormal_6, dir_3);
    float specularPdf_1 = specularProbWeight_0 / _S118 * pdfBaseSpecular_0(state_5.closure_1, baseNormal_6, viewDir_27, dir_3);

    if((state_5.closure_1.transmissionWeight_0) > 0.0)
    {

        pdf_0 = state_5.closure_1.transmissionWeight_0 / _S118 * pdfDielectricTransmission_0(state_5.closure_1, state_5.currentMediumIor_0, baseNormal_6, viewDir_27, dir_3);

    }
    else
    {

        pdf_0 = 0.0;

    }


    float _S119 = state_5.closure_1.clearcoatWeight_0 / _S118;
    if(_S113 > 0.0)
    {

        thinBaseProb_0 = pdfClearcoat_0(state_5.closure_1, clearcoatNormal_3, viewDir_27, dir_3);

    }
    else
    {

        thinBaseProb_0 = 0.0;

    }
    return max(diffusePdf_1 + sheenPdf_1 + specularPdf_1 + pdf_0 + _S119 * thinBaseProb_0, 0.00000999999974738);
}


float pdfMaterialBsdf_0(MaterialBsdfState_0 state_6, DirectionContext_0 directions_2, NormalContext_0 normals_3)
{

    return pdfMaterialBsdfMixture_0(state_6, normals_3.baseNormal_3, normals_3.clearcoatNormal_2, directions_2.viewDir_18, directions_2.lightDir_18);
}


float pdfPbrBsdf_0(MaterialBsdfState_0 state_7, DirectionContext_0 directions_3, NormalContext_0 normals_4)
{
    return pdfMaterialBsdf_0(state_7, directions_3, normals_4);
}


void orthonormalBasis_0(vec3 n_1, out vec3 tangent_2, out vec3 bitangent_0)
{

    float _S120 = n_1.z;

    float sign_0;

    if(_S120 >= 0.0)
    {

        sign_0 = 1.0;

    }
    else
    {

        sign_0 = -1.0;

    }
    float a_0 = -1.0 / (sign_0 + _S120);
    float _S121 = n_1.x;

    float _S122 = n_1.y;

    float b_0 = _S121 * _S122 * a_0;
    tangent_2 = normalize(vec3(1.0 + sign_0 * _S121 * _S121 * a_0, sign_0 * b_0, - sign_0 * _S121));
    bitangent_0 = normalize(vec3(b_0, sign_0 + _S122 * _S122 * a_0, - _S122));
    return;
}


vec3 sampleCosineHemisphere_0(vec3 normal_25, float u0_0, float u1_0)
{

    float r_0 = sqrt(u0_0);
    float phi_0 = 6.28318548202514648 * u1_0;
    float _S123 = r_0 * cos(phi_0);

    float _S124 = r_0 * sin(phi_0);

    float _S125 = sqrt(max(0.0, 1.0 - u0_0));
    vec3 tangent_3;
    vec3 bitangent_1;
    orthonormalBasis_0(normal_25, tangent_3, bitangent_1);
    return normalize(tangent_3 * _S123 + bitangent_1 * _S124 + normal_25 * _S125);
}


struct BsdfSample_0
{
    vec3 direction_0;
    float pdf_1;
    vec3 bsdfOverPdf_0;
    float specular_2;
    float crossedBoundary_0;
    float nextMediumIor_0;
};


BsdfSample_0 sampleDiffuseReflection_0(SurfaceClosure_0 closure_37, float currentMediumIor_6, vec3 normal_26, vec3 viewDir_28, float u0_1, float u1_1)
{

    vec3 dir_4 = sampleCosineHemisphere_0(normal_26, u0_1, u1_1);
    float _S126 = max(pdfDiffuseReflection_0(normal_26, dir_4), 0.00000999999974738);
    BsdfSample_0 sample_0;
    sample_0.direction_0 = dir_4;
    sample_0.pdf_1 = _S126;
    sample_0.bsdfOverPdf_0 = evalDiffuseReflection_0(closure_37, normal_26, viewDir_28, dir_4) / _S126;
    sample_0.specular_2 = 0.0;
    sample_0.crossedBoundary_0 = 0.0;
    sample_0.nextMediumIor_0 = currentMediumIor_6;
    return sample_0;
}


BsdfSample_0 sampleSheen_0(SurfaceClosure_0 closure_38, float currentMediumIor_7, vec3 normal_27, vec3 viewDir_29, float u0_2, float u1_2)
{

    vec3 dir_5 = sampleCosineHemisphere_0(normal_27, u0_2, u1_2);
    float _S127 = max(pdfSheen_0(normal_27, dir_5), 0.00000999999974738);

    BsdfSample_0 sample_1;
    sample_1.direction_0 = dir_5;
    sample_1.pdf_1 = _S127;
    sample_1.bsdfOverPdf_0 = evalSheen_0(closure_38, normal_27, viewDir_29, dir_5) / _S127;
    sample_1.specular_2 = 0.0;
    sample_1.crossedBoundary_0 = 0.0;
    sample_1.nextMediumIor_0 = currentMediumIor_7;
    return sample_1;
}


BsdfSample_0 sampleDiffuseTransmission_0(SurfaceClosure_0 closure_39, float currentMediumIor_8, vec3 normal_28, vec3 viewDir_30, float u0_3, float u1_3)
{

    vec3 dir_6 = sampleCosineHemisphere_0(- normal_28, u0_3, u1_3);
    float _S128 = max(pdfDiffuseTransmission_0(normal_28, dir_6), 0.00000999999974738);

    bool insideMedium_3;
    if((max(currentMediumIor_8, 1.0)) > 1.00010001659393311)
    {

        insideMedium_3 = (closure_39.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_3 = false;

    }

    BsdfSample_0 sample_2;
    sample_2.direction_0 = dir_6;
    sample_2.pdf_1 = _S128;
    sample_2.bsdfOverPdf_0 = evalDiffuseTransmission_0(closure_39, normal_28, dir_6) / _S128;
    sample_2.specular_2 = 0.0;
    bool _S129 = (closure_39.thinWalled_1) < 0.5;

    float _S130;

    if(_S129)
    {

        _S130 = 1.0;

    }
    else
    {

        _S130 = 0.0;

    }

    sample_2.crossedBoundary_0 = _S130;
    if(_S129)
    {

        if(insideMedium_3)
        {

            _S130 = 1.0;

        }
        else
        {

            _S130 = closure_39.ior_2;

        }

    }
    else
    {

        _S130 = currentMediumIor_8;

    }

    sample_2.nextMediumIor_0 = _S130;
    return sample_2;
}


void anisotropicBasis_0(vec3 normal_29, vec3 tangentInput_0, out vec3 tangent_4, out vec3 bitangent_2)
{

    vec3 _S131 = normalize(tangentInput_0 - normal_29 * dot(tangentInput_0, normal_29));

    tangent_4 = _S131;
    bitangent_2 = normalize(cross(normal_29, _S131));
    return;
}


vec3 sampleGGXHalfVector_0(SurfaceClosure_0 closure_40, vec3 normal_30, float roughness_9, float u0_4, float u1_4)
{

    vec2 alpha_29 = anisotropicAlpha_0(roughness_9, closure_40.anisotropy_1);
    float phi_1 = 6.28318548202514648 * u1_4;
    float sinPhi_0 = sin(phi_1);
    float cosPhi_0 = cos(phi_1);

    float _S132 = alpha_29.x;
    float _S133 = alpha_29.y;

    float cosTheta_10 = 1.0 / sqrt(1.0 + u0_4 / max(1.0 - u0_4, 9.99999997475242708e-07) / max(cosPhi_0 * cosPhi_0 / max(_S132 * _S132, 9.999999960041972e-13) + sinPhi_0 * sinPhi_0 / max(_S133 * _S133, 9.999999960041972e-13), 9.99999997475242708e-07));
    float sinTheta_0 = sqrt(max(0.0, 1.0 - cosTheta_10 * cosTheta_10));
    float _S134 = sinTheta_0 * cosPhi_0;

    float _S135 = sinTheta_0 * sinPhi_0;
    vec3 tangent_5;
    vec3 bitangent_3;
    anisotropicBasis_0(normal_30, closure_40.anisotropyTangent_1, tangent_5, bitangent_3);
    return normalize(tangent_5 * _S134 + bitangent_3 * _S135 + normal_30 * cosTheta_10);
}

float sampleHalfVectorPdf_0(SurfaceClosure_0 closure_41, vec3 normal_31, vec3 halfVec_6)
{

    vec3 localHalf_4 = projectToAnisotropicFrame_0(normal_31, closure_41.anisotropyTangent_1, halfVec_6);
    float noH_3 = abs(localHalf_4.z);
    if(noH_3 <= 0.00000999999974738)
    {

        return 0.0;
    }


    return ggxDistributionAnisotropic_0(anisotropicAlpha_0(closure_41.roughness_3, closure_41.anisotropy_1), localHalf_4) * noH_3;
}


vec3 dispersionChannelMask_0(float channelU_0)
{

    if(channelU_0 < 0.3333333432674408)
    {

        return vec3(1.0, 0.0, 0.0);
    }
    if(channelU_0 < 0.66666668653488159)
    {

        return vec3(0.0, 1.0, 0.0);
    }
    return vec3(0.0, 0.0, 1.0);
}

float selectDispersionIor_0(vec3 iors_1, vec3 mask_0)
{

    return dot(iors_1, mask_0);
}


vec3 safeRefract_0(vec3 incident_0, vec3 normal_32, float eta_1)
{

    float noI_0 = dot(normal_32, incident_0);
    float k_0 = 1.0 - eta_1 * eta_1 * (1.0 - noI_0 * noI_0);
    if(k_0 <= 0.0)
    {

        return vec3(0.0);
    }
    return eta_1 * incident_0 - (eta_1 * noI_0 + sqrt(k_0)) * normal_32;
}


BsdfSample_0 sampleDielectricTransmission_0(SurfaceClosure_0 closure_42, float currentMediumIor_9, vec3 transmissionNormal_1, vec3 normal_33, vec3 viewDir_31, float u0_5, float u1_5, float eventU_0)
{

    float _S136 = max(currentMediumIor_9, 1.0);

    bool insideMedium_4;
    if(_S136 > 1.00010001659393311)
    {

        insideMedium_4 = (closure_42.thinWalled_1) < 0.5;

    }
    else
    {

        insideMedium_4 = false;

    }

    float iorI_8;
    if(insideMedium_4)
    {

        iorI_8 = _S136;

    }
    else
    {

        iorI_8 = 1.0;

    }

    float iorO_8;
    if(insideMedium_4)
    {

        iorO_8 = 1.0;

    }
    else
    {

        iorO_8 = closure_42.ior_2;

    }

    bool _S137;
    if((closure_42.thinWalled_1) < 0.5)
    {

        _S137 = (abs(iorI_8 - iorO_8)) <= 0.00009999999747379;

    }
    else
    {

        _S137 = false;

    }

    if(_S137)
    {

        BsdfSample_0 nullSample_0;
        nullSample_0.direction_0 = - viewDir_31;
        nullSample_0.pdf_1 = 1.0;
        nullSample_0.bsdfOverPdf_0 = weightedTransmissionColor_1(closure_42);
        nullSample_0.specular_2 = 2.0;
        nullSample_0.crossedBoundary_0 = 1.0;
        nullSample_0.nextMediumIor_0 = iorO_8;
        return nullSample_0;
    }
    vec3 halfVec_7 = sampleGGXHalfVector_0(closure_42, normal_33, closure_42.roughness_3, u0_5, u1_5);
    DielectricTransmissionCoefficients_0 coeffs_3 = computeDielectricTransmissionCoefficients_0(closure_42, currentMediumIor_9, normal_33, viewDir_31, iorI_8, iorO_8);
    float halfPdf_0 = sampleHalfVectorPdf_0(closure_42, normal_33, halfVec_7);
    float probReflect_0 = clamp(coeffs_3.reflectionProb_0, 0.0, 1.0);
    float _S138 = max(coeffs_3.transmissionProb_0, 0.00000999999974738);

    BsdfSample_0 sample_3;
    sample_3.crossedBoundary_0 = 0.0;
    sample_3.nextMediumIor_0 = currentMediumIor_9;
    if(eventU_0 <= probReflect_0)
    {

        vec3 dir_7 = reflect(- viewDir_31, halfVec_7);
        float lobePdf_1 = halfPdf_0 / max(4.0 * abs(dot(dir_7, halfVec_7)), 0.00000999999974738);
        sample_3.direction_0 = dir_7;
        float _S139 = max(probReflect_0 * lobePdf_1, 0.00000999999974738);

        sample_3.pdf_1 = _S139;
        sample_3.bsdfOverPdf_0 = evaluateDielectricSpecularGGX_0(closure_42, normal_33, viewDir_31, dir_7, iorI_8, iorO_8) / _S139;
        sample_3.specular_2 = 1.0;
        return sample_3;
    }
    if((closure_42.thinWalled_1) > 0.5)
    {

        vec3 dir_8 = flipAcrossNormal_0(reflect(- viewDir_31, halfVec_7), normal_33);
        float lobePdf_2 = halfPdf_0 / max(4.0 * abs(dot(dir_8, halfVec_7)), 0.00000999999974738);
        sample_3.direction_0 = dir_8;
        float _S140 = max(_S138 * lobePdf_2, 0.00000999999974738);

        sample_3.pdf_1 = _S140;
        sample_3.bsdfOverPdf_0 = evaluateThinTransmissionScattering_0(closure_42, normal_33, viewDir_31, dir_8, iorI_8, iorO_8) / _S140;
        sample_3.specular_2 = 1.0;
        return sample_3;
    }

    bool _S141 = (closure_42.dispersion_2) > 0.00000999999974738;
    float channelU_1 = clamp((eventU_0 - probReflect_0) / max(_S138, 0.00000999999974738), 0.0, 0.99999898672103882);

    vec3 channelMask_0;
    if(_S141)
    {

        channelMask_0 = dispersionChannelMask_0(channelU_1);

    }
    else
    {

        channelMask_0 = vec3(1.0);

    }
    vec3 channelIors_0 = dispersionIors_0(closure_42);

    float transmittedIor_1;
    if(_S141)
    {

        transmittedIor_1 = selectDispersionIor_0(channelIors_0, channelMask_0);

    }
    else
    {

        transmittedIor_1 = closure_42.ior_2;

    }

    float channelProb_0;
    if(_S141)
    {

        channelProb_0 = 0.3333333432674408;

    }
    else
    {

        channelProb_0 = 1.0;

    }

    float sampleIorI_0;
    if(insideMedium_4)
    {

        sampleIorI_0 = transmittedIor_1;

    }
    else
    {

        sampleIorI_0 = 1.0;

    }

    float sampleIorO_0;
    if(insideMedium_4)
    {

        sampleIorO_0 = 1.0;

    }
    else
    {

        sampleIorO_0 = transmittedIor_1;

    }


    vec3 _S142 = - viewDir_31;

    vec3 refracted_0 = safeRefract_0(_S142, halfVec_7, sampleIorI_0 / max(sampleIorO_0, 0.00000999999974738));
    if((length(refracted_0)) <= 0.00000999999974738)
    {

        vec3 dir_9 = reflect(_S142, halfVec_7);
        float _S143 = max(pdfDielectricTransmission_0(closure_42, currentMediumIor_9, normal_33, viewDir_31, dir_9), 0.00000999999974738);
        sample_3.direction_0 = dir_9;
        sample_3.pdf_1 = _S143;
        sample_3.bsdfOverPdf_0 = evaluateDielectricSpecularGGX_0(closure_42, normal_33, viewDir_31, dir_9, iorI_8, iorO_8) / _S143;
        sample_3.specular_2 = 3.0;
        return sample_3;
    }


    float _S144 = dot(viewDir_31, halfVec_7);

    float _S145 = dot(refracted_0, halfVec_7);
    float lobePdf_3 = halfPdf_0 * (sampleIorO_0 * sampleIorO_0) * abs(_S145) / max(pow(sampleIorI_0 * _S144 + sampleIorO_0 * _S145, 2.0), 0.00000999999974738);


    float g1Light_0 = ggxSmithG1Anisotropic_0(anisotropicAlpha_0(closure_42.roughness_3, closure_42.anisotropy_1), projectToAnisotropicFrame_0(normal_33, closure_42.anisotropyTangent_1, refracted_0));

    float _S146 = abs(_S144);

    vec3 regularReflect_2 = fresnelSchlickDielectric_0(_S146, closure_42.dielectricSpecularColor_0, closure_42.dielectricSpecularF90_0, sampleIorI_0, sampleIorO_0, false);

    if((closure_42.iridescence_2) > 0.00000999999974738)
    {

        _S137 = iorI_8 <= 1.00010001659393311;

    }
    else
    {

        _S137 = false;

    }

    vec3 effectiveTransmissionCoeff_1;

    if(_S137)
    {

        effectiveTransmissionCoeff_1 = (vec3(1.0) - thinFilmDielectricFresnel_0(closure_42, _S146, regularReflect_2, 1.0)) * weightedTransmissionColor_1(closure_42);

    }
    else
    {

        effectiveTransmissionCoeff_1 = coeffs_3.transmissionCoeff_1;

    }



    sample_3.direction_0 = refracted_0;
    float _S147 = _S138 * channelProb_0;

    sample_3.pdf_1 = max(_S147 * lobePdf_3, 0.00000999999974738);
    sample_3.bsdfOverPdf_0 = effectiveTransmissionCoeff_1 * channelMask_0 / max(_S147, 0.00000999999974738) * g1Light_0;
    sample_3.specular_2 = 1.0;
    sample_3.crossedBoundary_0 = 1.0;
    if(insideMedium_4)
    {

        iorI_8 = 1.0;

    }
    else
    {

        iorI_8 = closure_42.ior_2;

    }

    sample_3.nextMediumIor_0 = iorI_8;
    return sample_3;
}


BsdfSample_0 sampleBaseSpecular_0(SurfaceClosure_0 closure_43, float currentMediumIor_10, vec3 normal_34, vec3 viewDir_32, float u0_6, float u1_6)
{

    vec3 dir_10 = reflect(- viewDir_32, sampleGGXHalfVector_0(closure_43, normal_34, closure_43.roughness_3, u0_6, u1_6));
    float _S148 = max(pdfBaseSpecular_0(closure_43, normal_34, viewDir_32, dir_10), 0.00000999999974738);

    BsdfSample_0 sample_4;
    sample_4.direction_0 = dir_10;
    sample_4.pdf_1 = _S148;
    sample_4.bsdfOverPdf_0 = evalBaseSpecular_0(closure_43, normal_34, viewDir_32, dir_10) / _S148;
    sample_4.specular_2 = 1.0;
    sample_4.crossedBoundary_0 = 0.0;
    sample_4.nextMediumIor_0 = currentMediumIor_10;
    return sample_4;
}


vec3 sampleGGXHalfVectorIsotropic_0(vec3 normal_35, float roughness_10, float u0_7, float u1_7)
{

    float _S149 = max(roughness_10 * roughness_10, 0.0);

    float phi_2 = 6.28318548202514648 * u1_7;
    float cosTheta_11 = sqrt((1.0 - u0_7) / max(1.0 + (_S149 * _S149 - 1.0) * u0_7, 9.99999997475242708e-07));
    float sinTheta_1 = sqrt(max(0.0, 1.0 - cosTheta_11 * cosTheta_11));
    float _S150 = sinTheta_1 * cos(phi_2);

    float _S151 = sinTheta_1 * sin(phi_2);
    vec3 tangent_6;
    vec3 bitangent_4;
    orthonormalBasis_0(normal_35, tangent_6, bitangent_4);
    return normalize(tangent_6 * _S150 + bitangent_4 * _S151 + normal_35 * cosTheta_11);
}


BsdfSample_0 sampleClearcoat_0(SurfaceClosure_0 closure_44, float currentMediumIor_11, vec3 normal_36, vec3 viewDir_33, float u0_8, float u1_8)
{

    vec3 dir_11 = reflect(- viewDir_33, sampleGGXHalfVectorIsotropic_0(normal_36, closure_44.clearcoatRoughness_1, u0_8, u1_8));
    float _S152 = max(pdfClearcoat_0(closure_44, normal_36, viewDir_33, dir_11), 0.00000999999974738);

    BsdfSample_0 sample_5;
    sample_5.direction_0 = dir_11;
    sample_5.pdf_1 = _S152;
    sample_5.bsdfOverPdf_0 = evalClearcoat_0(closure_44, normal_36, viewDir_33, dir_11) / _S152;
    sample_5.specular_2 = 1.0;
    sample_5.crossedBoundary_0 = 0.0;
    sample_5.nextMediumIor_0 = currentMediumIor_11;
    return sample_5;
}


BsdfSample_0 sampleMaterialBsdfMixture_0(MaterialBsdfState_0 state_8, vec3 rawGeometryNormal_1, vec3 transmissionNormal_2, vec3 baseNormal_7, vec3 clearcoatNormal_4, vec3 viewDir_34, float choiceU_0, float u0_9, float u1_9, float eventU_1)
{

    vec3 thinDir_0;

    vec3 clearcoatEval_0;



    if(isThinTransmissiveDielectric_0(state_8.closure_1))
    {

        float thinBaseProb_1 = thinInterfaceBaseProbability_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34);
        float thinSpecularProb_1 = 1.0 - thinBaseProb_1;
        float baseLayerWeight_2 = transmissiveBaseLayerWeight_0(state_8.closure_1);
        float _S153 = max(thinBaseProb_1 + thinSpecularProb_1 + state_8.closure_1.clearcoatWeight_0, 0.00000999999974738);
        float diffuseProb_0 = thinBaseProb_1 * (state_8.closure_1.diffuseWeight_0 / baseLayerWeight_2) / _S153;
        float sheenProb_0 = thinBaseProb_1 * (state_8.closure_1.sheenWeight_0 / baseLayerWeight_2) / _S153;
        float diffuseTransmissionProb_0 = thinBaseProb_1 * (state_8.closure_1.diffuseTransmissionWeight_0 / baseLayerWeight_2) / _S153;
        float thinTransmissionProb_0 = thinBaseProb_1 * (state_8.closure_1.transmissionWeight_0 / baseLayerWeight_2) / _S153;
        float specularProb_0 = thinSpecularProb_1 / _S153;

        BsdfSample_0 thinSample_0;

        thinSample_0.crossedBoundary_0 = 0.0;
        thinSample_0.nextMediumIor_0 = state_8.currentMediumIor_0;
        if(choiceU_0 < diffuseProb_0)
        {

            BsdfSample_0 diffuseSample_0 = sampleDiffuseReflection_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

            thinSample_0.specular_2 = diffuseSample_0.specular_2;

            thinDir_0 = diffuseSample_0.direction_0;

        }
        else
        {

            float _S154 = diffuseProb_0 + sheenProb_0;

            if(choiceU_0 < _S154)
            {

                BsdfSample_0 sheenSample_0 = sampleSheen_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                thinSample_0.specular_2 = sheenSample_0.specular_2;

                thinDir_0 = sheenSample_0.direction_0;

            }
            else
            {

                float _S155 = _S154 + diffuseTransmissionProb_0;

                if(choiceU_0 < _S155)
                {

                    BsdfSample_0 diffuseTransmissionSample_0 = sampleDiffuseTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                    thinSample_0.specular_2 = diffuseTransmissionSample_0.specular_2;

                    thinDir_0 = diffuseTransmissionSample_0.direction_0;

                }
                else
                {

                    float _S156 = _S155 + thinTransmissionProb_0;

                    if(choiceU_0 < _S156)
                    {

                        thinSample_0 = sampleDielectricTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, transmissionNormal_2, baseNormal_7, viewDir_34, u0_9, u1_9, 1.0);
                        float _S157 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinSample_0.direction_0);

                        thinSample_0.pdf_1 = _S157;
                        thinSample_0.bsdfOverPdf_0 = evalDielectricTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, thinSample_0.direction_0) / max(_S157, 0.00000999999974738);


                        return thinSample_0;
                    }
                    else
                    {

                        if(choiceU_0 < (_S156 + specularProb_0))
                        {

                            BsdfSample_0 specularSample_0 = sampleBaseSpecular_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                            thinSample_0.specular_2 = specularSample_0.specular_2;

                            thinDir_0 = specularSample_0.direction_0;

                        }
                        else
                        {


                            BsdfSample_0 clearcoatSample_0 = sampleClearcoat_0(state_8.closure_1, state_8.currentMediumIor_0, clearcoatNormal_4, viewDir_34, u0_9, u1_9);

                            thinSample_0.specular_2 = clearcoatSample_0.specular_2;

                            thinDir_0 = clearcoatSample_0.direction_0;

                        }

                    }

                }

            }

        }

        float _S158 = dot(baseNormal_7, thinDir_0);

        float _S159 = max(_S158, 0.0);
        float _S160 = max(dot(clearcoatNormal_4, thinDir_0), 0.0);
        bool transmissionSide_1 = _S158 < 0.0;
        if(_S159 <= 0.0)
        {

            if(transmissionSide_1)
            {

                float mixPdf_0 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
                vec3 diffuseTransmissionEval_0 = evalDiffuseTransmission_0(state_8.closure_1, baseNormal_7, thinDir_0);
                thinSample_0.direction_0 = thinDir_0;
                float _S161 = max(mixPdf_0, 0.00000999999974738);

                thinSample_0.pdf_1 = _S161;
                thinSample_0.bsdfOverPdf_0 = diffuseTransmissionEval_0 / max(_S161, 0.00000999999974738);
                thinSample_0.specular_2 = 0.0;
                return thinSample_0;
            }
            vec3 fallbackDir_0 = sampleCosineHemisphere_0(baseNormal_7, u0_9, u1_9);
            float _S162 = max(dot(baseNormal_7, fallbackDir_0), 0.0);
            thinSample_0.direction_0 = fallbackDir_0;
            thinSample_0.pdf_1 = max(_S162 * 0.31830987334251404, 0.00000999999974738);
            thinSample_0.bsdfOverPdf_0 = vec3(0.0);
            thinSample_0.specular_2 = 0.0;
            return thinSample_0;
        }

        float mixPdf_1 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
        vec3 reflectedBaseEval_0 = evaluateReflectedBaseScattering_0(state_8, baseNormal_7, viewDir_34, thinDir_0) / max(_S159, 0.00000999999974738);
        if(_S160 > 0.0)
        {

            clearcoatEval_0 = evalClearcoat_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0) / max(_S160, 0.00000999999974738);

        }
        else
        {

            clearcoatEval_0 = vec3(0.0);

        }
        float baseWeight_0 = clearcoatBaseWeight_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0);

        thinSample_0.direction_0 = thinDir_0;
        thinSample_0.pdf_1 = mixPdf_1;
        thinSample_0.bsdfOverPdf_0 = (reflectedBaseEval_0 * baseWeight_0 + clearcoatEval_0) * _S159 / max(mixPdf_1, 0.00000999999974738);
        return thinSample_0;
    }

    float dielectricViewFresnel_1 = dielectricViewFresnelMax_0(state_8.closure_1, baseNormal_7, viewDir_34);
    float _S163 = 1.0 - dielectricViewFresnel_1;

    float diffuseProbWeight_1 = state_8.closure_1.diffuseWeight_0 * _S163;
    float sheenProbWeight_1 = state_8.closure_1.sheenWeight_0 * _S163;

    float specularProbWeight_1 = state_8.closure_1.specularWeight_0 + state_8.closure_1.dielectricWeight_0 * (1.0 - state_8.closure_1.transparency_1) * dielectricViewFresnel_1;
    float baseProbWeight_0 = diffuseProbWeight_1 + sheenProbWeight_1 + state_8.closure_1.diffuseTransmissionWeight_0;
    float _S164 = max(baseProbWeight_0 + specularProbWeight_1 + state_8.closure_1.transmissionWeight_0 + state_8.closure_1.clearcoatWeight_0, 0.00000999999974738);

    float baseProb_0 = baseProbWeight_0 / _S164;
    float specularProb_1 = specularProbWeight_1 / _S164;
    float transmissionProb_1 = state_8.closure_1.transmissionWeight_0 / _S164;

    BsdfSample_0 sample_6;

    sample_6.crossedBoundary_0 = 0.0;
    sample_6.nextMediumIor_0 = state_8.currentMediumIor_0;
    if(choiceU_0 < baseProb_0)
    {

        float baseChoiceU_0 = choiceU_0 / max(baseProb_0, 0.00000999999974738);
        bool _S165 = baseProbWeight_0 > 0.0;

        float diffuseReflectProb_0;

        if(_S165)
        {

            diffuseReflectProb_0 = diffuseProbWeight_1 / baseProbWeight_0;

        }
        else
        {

            diffuseReflectProb_0 = 0.0;

        }

        float sheenReflectProb_0;
        if(_S165)
        {

            sheenReflectProb_0 = sheenProbWeight_1 / baseProbWeight_0;

        }
        else
        {

            sheenReflectProb_0 = 0.0;

        }
        if(baseChoiceU_0 < diffuseReflectProb_0)
        {

            BsdfSample_0 diffuseSample_1 = sampleDiffuseReflection_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

            sample_6.specular_2 = diffuseSample_1.specular_2;

            thinDir_0 = diffuseSample_1.direction_0;

        }
        else
        {

            if(baseChoiceU_0 < (diffuseReflectProb_0 + sheenReflectProb_0))
            {

                BsdfSample_0 sheenSample_1 = sampleSheen_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                sample_6.specular_2 = sheenSample_1.specular_2;

                thinDir_0 = sheenSample_1.direction_0;

            }
            else
            {


                BsdfSample_0 diffuseTransmissionSample_1 = sampleDiffuseTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

                sample_6.specular_2 = diffuseTransmissionSample_1.specular_2;
                sample_6.crossedBoundary_0 = diffuseTransmissionSample_1.crossedBoundary_0;
                sample_6.nextMediumIor_0 = diffuseTransmissionSample_1.nextMediumIor_0;

                thinDir_0 = diffuseTransmissionSample_1.direction_0;

            }

        }

    }
    else
    {

        float _S166 = baseProb_0 + specularProb_1;

        if(choiceU_0 < _S166)
        {

            BsdfSample_0 specularSample_1 = sampleBaseSpecular_0(state_8.closure_1, state_8.currentMediumIor_0, baseNormal_7, viewDir_34, u0_9, u1_9);

            sample_6.specular_2 = specularSample_1.specular_2;

            thinDir_0 = specularSample_1.direction_0;

        }
        else
        {

            BsdfSample_0 _S167;



            if(choiceU_0 < (_S166 + transmissionProb_1))
            {

                sample_6 = sampleDielectricTransmission_0(state_8.closure_1, state_8.currentMediumIor_0, transmissionNormal_2, baseNormal_7, viewDir_34, u0_9, u1_9, eventU_1);
                sample_6.bsdfOverPdf_0 = sample_6.bsdfOverPdf_0 / max(transmissionProb_1, 0.00000999999974738);
                if((sample_6.pdf_1) < 1.0)
                {

                    sample_6.pdf_1 = sample_6.pdf_1 * transmissionProb_1;

                }


                return sample_6;
            }
            else
            {

                BsdfSample_0 clearcoatSample_1 = sampleClearcoat_0(state_8.closure_1, state_8.currentMediumIor_0, clearcoatNormal_4, viewDir_34, u0_9, u1_9);

                _S167 = clearcoatSample_1;

                sample_6.specular_2 = clearcoatSample_1.specular_2;

            }

            thinDir_0 = _S167.direction_0;

        }

    }

    float _S168 = dot(baseNormal_7, thinDir_0);

    float _S169 = max(_S168, 0.0);
    float _S170 = max(dot(clearcoatNormal_4, thinDir_0), 0.0);
    bool transmissionSide_2 = _S168 < 0.0;
    float absNoL_0 = abs(_S168);
    if(_S169 <= 0.0)
    {

        if(transmissionSide_2)
        {

            float mixPdf_2 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
            vec3 diffuseTransmissionEval_1 = evalDiffuseTransmission_0(state_8.closure_1, baseNormal_7, thinDir_0);
            sample_6.direction_0 = thinDir_0;
            float _S171 = max(mixPdf_2, 0.00000999999974738);

            sample_6.pdf_1 = _S171;
            sample_6.bsdfOverPdf_0 = diffuseTransmissionEval_1 / _S171;
            sample_6.specular_2 = 0.0;
            return sample_6;
        }
        vec3 fallbackDir_1 = sampleCosineHemisphere_0(baseNormal_7, u0_9, u1_9);
        float _S172 = max(dot(baseNormal_7, fallbackDir_1), 0.0);
        sample_6.direction_0 = fallbackDir_1;
        sample_6.pdf_1 = max(_S172 * 0.31830987334251404, 0.00000999999974738);
        sample_6.bsdfOverPdf_0 = vec3(0.0);
        sample_6.specular_2 = 0.0;
        sample_6.nextMediumIor_0 = state_8.currentMediumIor_0;
        return sample_6;
    }

    float mixPdf_3 = pdfMaterialBsdfMixture_0(state_8, baseNormal_7, clearcoatNormal_4, viewDir_34, thinDir_0);
    vec3 reflectedBaseEval_1 = evaluateReflectedBaseScattering_0(state_8, baseNormal_7, viewDir_34, thinDir_0) / max(_S169, 0.00000999999974738);
    if(_S170 > 0.0)
    {

        clearcoatEval_0 = evalClearcoat_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0) / max(_S170, 0.00000999999974738);

    }
    else
    {

        clearcoatEval_0 = vec3(0.0);

    }
    float baseWeight_1 = clearcoatBaseWeight_0(state_8.closure_1, clearcoatNormal_4, viewDir_34, thinDir_0);

    sample_6.direction_0 = thinDir_0;
    sample_6.pdf_1 = mixPdf_3;
    sample_6.bsdfOverPdf_0 = (reflectedBaseEval_1 * baseWeight_1 + clearcoatEval_0) * absNoL_0 / mixPdf_3;
    sample_6.nextMediumIor_0 = state_8.currentMediumIor_0;
    return sample_6;
}


struct SampleRandoms_0
{
    float component_0;
    vec2 lobe_0;
    float boundary_0;
};


BsdfSample_0 sampleMaterialBsdf_0(MaterialBsdfState_0 state_9, DirectionContext_0 directions_4, NormalContext_0 normals_5, SampleRandoms_0 randoms_0)
{



    return sampleMaterialBsdfMixture_0(state_9, normals_5.rawGeometryNormal_0, normals_5.transmissionNormal_0, normals_5.baseNormal_3, normals_5.clearcoatNormal_2, directions_4.viewDir_18, randoms_0.component_0, randoms_0.lobe_0.x, randoms_0.lobe_0.y, randoms_0.boundary_0);
}


BsdfSample_0 samplePbrBsdf_0(MaterialBsdfState_0 state_10, DirectionContext_0 directions_5, NormalContext_0 normals_6, SampleRandoms_0 randoms_1)
{

    return sampleMaterialBsdf_0(state_10, directions_5, normals_6, randoms_1);
}


vec3 multiscatterToSingleScatterAlbedo_0(vec3 multiscatterColor_2, float scatterAnisotropy_3)
{
    return multiscatterColor_2 * 0.0 + vec3(scatterAnisotropy_3 * 0.0);
}


struct MaterialVolumeState_0
{
    vec3 sigmaT_0;
    float isActive_0;
    vec3 rhoSs_0;
    float scatterAnisotropy_4;
    vec3 sigmaA_0;
    float _pad0_1;
};


MaterialVolumeState_0 buildVolumeCoefficients_0(SurfaceClosure_0 closure_45)
{

    MaterialVolumeState_0 volume_0;

    volume_0.sigmaT_0 = - log(max(closure_45.attenuationColor_2, vec3(0.00009999999747379))) / max(closure_45.attenuationDistance_2, 0.00009999999747379);

    float _S173;
    if((closure_45.thinWalled_1) < 0.5)
    {

        _S173 = 1.0;

    }
    else
    {

        _S173 = 0.0;

    }

    volume_0.isActive_0 = _S173;

    volume_0.scatterAnisotropy_4 = 0.0;


    vec3 _S174 = multiscatterToSingleScatterAlbedo_0(closure_45.multiscatterColor_1, 0.0);

    volume_0.rhoSs_0 = _S174;
    volume_0.sigmaA_0 = max(volume_0.sigmaT_0 * (vec3(1.0) - _S174), vec3(0.0));
    volume_0._pad0_1 = 0.0;
    return volume_0;
}


MaterialVolumeState_0 prepareMaterialVolumeState_0(MaterialBsdfState_0 bsdfState_0)
{

    return buildVolumeCoefficients_0(bsdfState_0.closure_1);
}


MaterialVolumeState_0 preparePbrVolumeState_0(MaterialBsdfState_0 state_11)
{
    return prepareMaterialVolumeState_0(state_11);
}


vec3 evalHomogeneousTransmittance_0(MaterialVolumeState_0 volume_1, float distance_0)
{


    return exp(- max(volume_1.sigmaT_0, vec3(0.0)) * max(distance_0, 0.0));
}


vec3 evalPbrHomogeneousTransmittance_0(MaterialVolumeState_0 volume_2, float distance_1)
{

    return evalHomogeneousTransmittance_0(volume_2, distance_1);
}


float homogeneousMediumEventPdf_0(MaterialVolumeState_0 volume_3, float distance_2)
{
    return 0.00000999999974738;
}


float pbrHomogeneousMediumEventPdf_0(MaterialVolumeState_0 volume_4, float distance_3)
{

    return homogeneousMediumEventPdf_0(volume_4, distance_3);
}


float homogeneousMediumNoEventPdf_0(MaterialVolumeState_0 volume_5, float distance_4)
{

    vec3 tr_0 = evalHomogeneousTransmittance_0(volume_5, distance_4);
    return max((tr_0.x + tr_0.y + tr_0.z) / 3.0, 0.00000999999974738);
}


float pbrHomogeneousMediumNoEventPdf_0(MaterialVolumeState_0 volume_6, float distance_5)
{

    return homogeneousMediumNoEventPdf_0(volume_6, distance_5);
}


MaterialVolumeState_0 clearMaterialVolumeState_0()
{

    MaterialVolumeState_0 volume_7;
    const vec3 _S175 = vec3(0.0);

    volume_7.sigmaT_0 = _S175;
    volume_7.rhoSs_0 = _S175;
    volume_7.sigmaA_0 = _S175;
    volume_7.scatterAnisotropy_4 = 0.0;
    volume_7._pad0_1 = 0.0;
    volume_7.isActive_0 = 0.0;
    return volume_7;
}


MaterialVolumeState_0 clearPbrVolumeState_0()
{

    return clearMaterialVolumeState_0();
}


MaterialVolumeState_0 enterMaterialVolumeState_0(MaterialVolumeState_0 volume_8)
{

    MaterialVolumeState_0 entered_0 = volume_8;

    float _S176;
    if((volume_8.isActive_0) > 0.5)
    {

        _S176 = 1.0;

    }
    else
    {

        _S176 = 0.0;

    }

    entered_0.isActive_0 = _S176;
    return entered_0;
}


MaterialVolumeState_0 enterPbrVolumeState_0(MaterialVolumeState_0 volume_9)
{

    return enterMaterialVolumeState_0(volume_9);
}


float evalVolumePhase_0(MaterialVolumeState_0 volume_10, vec3 incidentDir_0, vec3 outgoingDir_0)
{
    return 0.0;
}



float pdfVolumePhase_0(MaterialVolumeState_0 volume_11, vec3 incidentDir_1, vec3 outgoingDir_1)
{

    return evalVolumePhase_0(volume_11, incidentDir_1, outgoingDir_1);
}


struct VolumePhaseSample_0
{
    vec3 direction_1;
    float pdf_2;
};


VolumePhaseSample_0 sampleVolumePhase_0(MaterialVolumeState_0 volume_12, vec3 incidentDir_2, vec2 randoms_2)
{
    VolumePhaseSample_0 disabledSample_0;
    disabledSample_0.direction_1 = incidentDir_2;
    disabledSample_0.pdf_2 = 0.0;
    return disabledSample_0;
}


VolumePhaseSample_0 samplePbrVolumePhase_0(MaterialVolumeState_0 volume_13, vec3 incidentDir_3, vec2 randoms_3)
{

    return sampleVolumePhase_0(volume_13, incidentDir_3, randoms_3);
}


float evalPbrVolumePhase_0(MaterialVolumeState_0 volume_14, vec3 incidentDir_4, vec3 outgoingDir_2)
{

    return evalVolumePhase_0(volume_14, incidentDir_4, outgoingDir_2);
}

float pdfPbrVolumePhase_0(MaterialVolumeState_0 volume_15, vec3 incidentDir_5, vec3 outgoingDir_3)
{

    return pdfVolumePhase_0(volume_15, incidentDir_5, outgoingDir_3);
}

// Stable adapter-facing facade. Code outside this generated file should use

// Pbr* names only; generated Slang backend names stay private here.



struct PbrGltfMaterial
{
    vec4 baseColorFactor;
    float metallicFactor;
    float roughnessFactor;
    vec3 emissiveFactor;
    float emissiveStrength;
    float specularFactor;
    vec3 specularColorFactor;
    float transmissionFactor;
    float diffuseTransmissionFactor;
    vec3 diffuseTransmissionColorFactor;
    float ior;
    vec3 attenuationColor;
    float attenuationDistance;
    float thicknessFactor;
    vec3 multiscatterColorFactor;
    float scatterAnisotropy;
    float clearcoatFactor;
    float clearcoatRoughnessFactor;
    float clearcoatNormalTextureScale;
    vec3 sheenColorFactor;
    float sheenRoughnessFactor;
    float anisotropyStrength;
    float anisotropyRotation;
    float iridescenceFactor;
    float iridescenceIor;
    float iridescenceThickness;
    float dispersion;
    float normalTextureScale;
    uint featureMask;
};

struct PbrMaterial
{
    vec3 albedo;
    float metallic;
    float roughness;
    float anisotropy;
    vec3 anisotropyDirection;
    float transparency;
    float ior;
    vec3 specularColor;
    float specular;
    vec3 emission;
    float normalScale;
    vec3 attenuationColor;
    float attenuationDistance;
    vec3 multiscatterColor;
    float scatterAnisotropy;
    float thinWalled;
    float translucency;
    vec3 translucencyColor;
    float iridescence;
    float iridescenceIor;
    float iridescenceThickness;
    float dispersion;
    float clearcoat;
    float clearcoatRoughness;
    vec3 sheenColor;
    float sheenRoughness;
    float clearcoatNormalScale;
    float frontFaceEmissionOnly;
};

struct PbrLayerNormals
{
    vec3 rawGeometry;
    vec3 geometry;
    vec3 shadingGeometry;
    vec3 interfaceBase;
    vec3 base;
    vec3 clearcoat;
    vec3 anisotropyTangent;
};

struct PbrClosure
{
    vec3 diffuseColor;
    vec3 diffuseReflectionColor;
    vec3 transmissionColor;
    float diffuseWeight;
    float sheenWeight;
    float anisotropy;
    vec3 anisotropyTangent;
    vec3 specularColor;
    vec3 specularF90;
    vec3 dielectricSpecularColor;
    vec3 dielectricSpecularF90;
    float dielectricWeight;
    float specularWeight;
    float clearcoatWeight;
    float roughness;
    vec3 sheenColor;
    float sheenRoughness;
    float transparency;
    float clearcoat;
    float clearcoatRoughness;
    vec3 throughput;
    float metallic;
    float specular;
    float ior;
    float iridescence;
    float iridescenceIor;
    float iridescenceThickness;
    float dispersion;
    float thinWalled;
    vec3 attenuationColor;
    float attenuationDistance;
    vec3 multiscatterColor;
    float scatterAnisotropy;
    float transmissionWeight;
    vec3 diffuseTransmissionColor;
    float diffuseTransmissionWeight;
};

struct PbrTransport
{
    float currentMediumIor;
    float interfaceIor;
    float thinWalled;
    float _pad0;
};

struct PbrDirections
{
    vec3 viewDir;
    vec3 lightDir;
};

struct PbrNormals
{
    vec3 rawGeometryNormal;
    vec3 transmissionNormal;
    vec3 baseNormal;
    vec3 clearcoatNormal;
};

struct PbrRandoms
{
    float component;
    vec2 lobe;
    float boundary;
};

struct PbrSample
{
    vec3 direction;
    float pdf;
    vec3 bsdfOverPdf;
    float specular;
    float crossedBoundary;
    float nextMediumIor;
};

struct PbrVolume
{
    vec3 sigmaT;
    float isActive;
    vec3 rhoSs;
    float scatterAnisotropy;
    vec3 sigmaA;
    float _pad0;
};

struct PbrPhaseSample
{
    vec3 direction;
    float pdf;
};

struct PbrState
{
    PbrMaterial surface;
    PbrClosure closure;
    float currentMediumIor;
};

struct PbrGltfState
{
    PbrGltfMaterial material;
    PbrClosure closure;
    float currentMediumIor;
};

GltfPbrMaterial_0 pbrToGeneratedGltfPbrMaterial(PbrGltfMaterial stable)
{
    GltfPbrMaterial_0 generated;
    generated.baseColorFactor_0 = stable.baseColorFactor;
    generated.metallicFactor_0 = stable.metallicFactor;
    generated.roughnessFactor_0 = stable.roughnessFactor;
    generated.emissiveFactor_0 = stable.emissiveFactor;
    generated.emissiveStrength_0 = stable.emissiveStrength;
    generated.specularFactor_0 = stable.specularFactor;
    generated.specularColorFactor_0 = stable.specularColorFactor;
    generated.transmissionFactor_0 = stable.transmissionFactor;
    generated.diffuseTransmissionFactor_0 = stable.diffuseTransmissionFactor;
    generated.diffuseTransmissionColorFactor_0 = stable.diffuseTransmissionColorFactor;
    generated.ior_0 = stable.ior;
    generated.attenuationColor_0 = stable.attenuationColor;
    generated.attenuationDistance_0 = stable.attenuationDistance;
    generated.thicknessFactor_0 = stable.thicknessFactor;
    generated.multiscatterColorFactor_0 = stable.multiscatterColorFactor;
    generated.scatterAnisotropy_0 = stable.scatterAnisotropy;
    generated.clearcoatFactor_0 = stable.clearcoatFactor;
    generated.clearcoatRoughnessFactor_0 = stable.clearcoatRoughnessFactor;
    generated.clearcoatNormalTextureScale_0 = stable.clearcoatNormalTextureScale;
    generated.sheenColorFactor_0 = stable.sheenColorFactor;
    generated.sheenRoughnessFactor_0 = stable.sheenRoughnessFactor;
    generated.anisotropyStrength_0 = stable.anisotropyStrength;
    generated.anisotropyRotation_0 = stable.anisotropyRotation;
    generated.iridescenceFactor_0 = stable.iridescenceFactor;
    generated.iridescenceIor_0 = stable.iridescenceIor;
    generated.iridescenceThickness_0 = stable.iridescenceThickness;
    generated.dispersion_0 = stable.dispersion;
    generated.normalTextureScale_0 = stable.normalTextureScale;
    generated.featureMask_0 = stable.featureMask;
    return generated;
}

PbrGltfMaterial pbrFromGeneratedGltfPbrMaterial(GltfPbrMaterial_0 generated)
{
    PbrGltfMaterial stable;
    stable.baseColorFactor = generated.baseColorFactor_0;
    stable.metallicFactor = generated.metallicFactor_0;
    stable.roughnessFactor = generated.roughnessFactor_0;
    stable.emissiveFactor = generated.emissiveFactor_0;
    stable.emissiveStrength = generated.emissiveStrength_0;
    stable.specularFactor = generated.specularFactor_0;
    stable.specularColorFactor = generated.specularColorFactor_0;
    stable.transmissionFactor = generated.transmissionFactor_0;
    stable.diffuseTransmissionFactor = generated.diffuseTransmissionFactor_0;
    stable.diffuseTransmissionColorFactor = generated.diffuseTransmissionColorFactor_0;
    stable.ior = generated.ior_0;
    stable.attenuationColor = generated.attenuationColor_0;
    stable.attenuationDistance = generated.attenuationDistance_0;
    stable.thicknessFactor = generated.thicknessFactor_0;
    stable.multiscatterColorFactor = generated.multiscatterColorFactor_0;
    stable.scatterAnisotropy = generated.scatterAnisotropy_0;
    stable.clearcoatFactor = generated.clearcoatFactor_0;
    stable.clearcoatRoughnessFactor = generated.clearcoatRoughnessFactor_0;
    stable.clearcoatNormalTextureScale = generated.clearcoatNormalTextureScale_0;
    stable.sheenColorFactor = generated.sheenColorFactor_0;
    stable.sheenRoughnessFactor = generated.sheenRoughnessFactor_0;
    stable.anisotropyStrength = generated.anisotropyStrength_0;
    stable.anisotropyRotation = generated.anisotropyRotation_0;
    stable.iridescenceFactor = generated.iridescenceFactor_0;
    stable.iridescenceIor = generated.iridescenceIor_0;
    stable.iridescenceThickness = generated.iridescenceThickness_0;
    stable.dispersion = generated.dispersion_0;
    stable.normalTextureScale = generated.normalTextureScale_0;
    stable.featureMask = generated.featureMask_0;
    return stable;
}

SurfaceMaterial_0 pbrToGeneratedSurfaceMaterial(PbrMaterial stable)
{
    SurfaceMaterial_0 generated;
    generated.albedo_0 = stable.albedo;
    generated.metallic_0 = stable.metallic;
    generated.roughness_1 = stable.roughness;
    generated.anisotropy_0 = stable.anisotropy;
    generated.anisotropyDirection_0 = stable.anisotropyDirection;
    generated.transparency_0 = stable.transparency;
    generated.ior_1 = stable.ior;
    generated.specularColor_0 = stable.specularColor;
    generated.specular_0 = stable.specular;
    generated.emission_0 = stable.emission;
    generated.normalScale_0 = stable.normalScale;
    generated.attenuationColor_1 = stable.attenuationColor;
    generated.attenuationDistance_1 = stable.attenuationDistance;
    generated.multiscatterColor_0 = stable.multiscatterColor;
    generated.scatterAnisotropy_1 = stable.scatterAnisotropy;
    generated.thinWalled_0 = stable.thinWalled;
    generated.translucency_0 = stable.translucency;
    generated.translucencyColor_0 = stable.translucencyColor;
    generated.iridescence_0 = stable.iridescence;
    generated.iridescenceIor_1 = stable.iridescenceIor;
    generated.iridescenceThickness_1 = stable.iridescenceThickness;
    generated.dispersion_1 = stable.dispersion;
    generated.clearcoat_0 = stable.clearcoat;
    generated.clearcoatRoughness_0 = stable.clearcoatRoughness;
    generated.sheenColor_0 = stable.sheenColor;
    generated.sheenRoughness_0 = stable.sheenRoughness;
    generated.clearcoatNormalScale_0 = stable.clearcoatNormalScale;
    generated.frontFaceEmissionOnly_0 = stable.frontFaceEmissionOnly;
    return generated;
}

PbrMaterial pbrFromGeneratedSurfaceMaterial(SurfaceMaterial_0 generated)
{
    PbrMaterial stable;
    stable.albedo = generated.albedo_0;
    stable.metallic = generated.metallic_0;
    stable.roughness = generated.roughness_1;
    stable.anisotropy = generated.anisotropy_0;
    stable.anisotropyDirection = generated.anisotropyDirection_0;
    stable.transparency = generated.transparency_0;
    stable.ior = generated.ior_1;
    stable.specularColor = generated.specularColor_0;
    stable.specular = generated.specular_0;
    stable.emission = generated.emission_0;
    stable.normalScale = generated.normalScale_0;
    stable.attenuationColor = generated.attenuationColor_1;
    stable.attenuationDistance = generated.attenuationDistance_1;
    stable.multiscatterColor = generated.multiscatterColor_0;
    stable.scatterAnisotropy = generated.scatterAnisotropy_1;
    stable.thinWalled = generated.thinWalled_0;
    stable.translucency = generated.translucency_0;
    stable.translucencyColor = generated.translucencyColor_0;
    stable.iridescence = generated.iridescence_0;
    stable.iridescenceIor = generated.iridescenceIor_1;
    stable.iridescenceThickness = generated.iridescenceThickness_1;
    stable.dispersion = generated.dispersion_1;
    stable.clearcoat = generated.clearcoat_0;
    stable.clearcoatRoughness = generated.clearcoatRoughness_0;
    stable.sheenColor = generated.sheenColor_0;
    stable.sheenRoughness = generated.sheenRoughness_0;
    stable.clearcoatNormalScale = generated.clearcoatNormalScale_0;
    stable.frontFaceEmissionOnly = generated.frontFaceEmissionOnly_0;
    return stable;
}

SurfaceLayerNormals_0 pbrToGeneratedSurfaceLayerNormals(PbrLayerNormals stable)
{
    SurfaceLayerNormals_0 generated;
    generated.rawGeometry_0 = stable.rawGeometry;
    generated.geometry_0 = stable.geometry;
    generated.shadingGeometry_0 = stable.shadingGeometry;
    generated.interfaceBase_0 = stable.interfaceBase;
    generated.base_0 = stable.base;
    generated.clearcoat_1 = stable.clearcoat;
    generated.anisotropyTangent_0 = stable.anisotropyTangent;
    return generated;
}

PbrLayerNormals pbrFromGeneratedSurfaceLayerNormals(SurfaceLayerNormals_0 generated)
{
    PbrLayerNormals stable;
    stable.rawGeometry = generated.rawGeometry_0;
    stable.geometry = generated.geometry_0;
    stable.shadingGeometry = generated.shadingGeometry_0;
    stable.interfaceBase = generated.interfaceBase_0;
    stable.base = generated.base_0;
    stable.clearcoat = generated.clearcoat_1;
    stable.anisotropyTangent = generated.anisotropyTangent_0;
    return stable;
}

SurfaceClosure_0 pbrToGeneratedSurfaceClosure(PbrClosure stable)
{
    SurfaceClosure_0 generated;
    generated.diffuseColor_0 = stable.diffuseColor;
    generated.diffuseReflectionColor_0 = stable.diffuseReflectionColor;
    generated.transmissionColor_0 = stable.transmissionColor;
    generated.diffuseWeight_0 = stable.diffuseWeight;
    generated.sheenWeight_0 = stable.sheenWeight;
    generated.anisotropy_1 = stable.anisotropy;
    generated.anisotropyTangent_1 = stable.anisotropyTangent;
    generated.specularColor_1 = stable.specularColor;
    generated.specularF90_0 = stable.specularF90;
    generated.dielectricSpecularColor_0 = stable.dielectricSpecularColor;
    generated.dielectricSpecularF90_0 = stable.dielectricSpecularF90;
    generated.dielectricWeight_0 = stable.dielectricWeight;
    generated.specularWeight_0 = stable.specularWeight;
    generated.clearcoatWeight_0 = stable.clearcoatWeight;
    generated.roughness_3 = stable.roughness;
    generated.sheenColor_1 = stable.sheenColor;
    generated.sheenRoughness_1 = stable.sheenRoughness;
    generated.transparency_1 = stable.transparency;
    generated.clearcoat_2 = stable.clearcoat;
    generated.clearcoatRoughness_1 = stable.clearcoatRoughness;
    generated.throughput_0 = stable.throughput;
    generated.metallic_1 = stable.metallic;
    generated.specular_1 = stable.specular;
    generated.ior_2 = stable.ior;
    generated.iridescence_2 = stable.iridescence;
    generated.iridescenceIor_2 = stable.iridescenceIor;
    generated.iridescenceThickness_2 = stable.iridescenceThickness;
    generated.dispersion_2 = stable.dispersion;
    generated.thinWalled_1 = stable.thinWalled;
    generated.attenuationColor_2 = stable.attenuationColor;
    generated.attenuationDistance_2 = stable.attenuationDistance;
    generated.multiscatterColor_1 = stable.multiscatterColor;
    generated.scatterAnisotropy_2 = stable.scatterAnisotropy;
    generated.transmissionWeight_0 = stable.transmissionWeight;
    generated.diffuseTransmissionColor_0 = stable.diffuseTransmissionColor;
    generated.diffuseTransmissionWeight_0 = stable.diffuseTransmissionWeight;
    return generated;
}

PbrClosure pbrFromGeneratedSurfaceClosure(SurfaceClosure_0 generated)
{
    PbrClosure stable;
    stable.diffuseColor = generated.diffuseColor_0;
    stable.diffuseReflectionColor = generated.diffuseReflectionColor_0;
    stable.transmissionColor = generated.transmissionColor_0;
    stable.diffuseWeight = generated.diffuseWeight_0;
    stable.sheenWeight = generated.sheenWeight_0;
    stable.anisotropy = generated.anisotropy_1;
    stable.anisotropyTangent = generated.anisotropyTangent_1;
    stable.specularColor = generated.specularColor_1;
    stable.specularF90 = generated.specularF90_0;
    stable.dielectricSpecularColor = generated.dielectricSpecularColor_0;
    stable.dielectricSpecularF90 = generated.dielectricSpecularF90_0;
    stable.dielectricWeight = generated.dielectricWeight_0;
    stable.specularWeight = generated.specularWeight_0;
    stable.clearcoatWeight = generated.clearcoatWeight_0;
    stable.roughness = generated.roughness_3;
    stable.sheenColor = generated.sheenColor_1;
    stable.sheenRoughness = generated.sheenRoughness_1;
    stable.transparency = generated.transparency_1;
    stable.clearcoat = generated.clearcoat_2;
    stable.clearcoatRoughness = generated.clearcoatRoughness_1;
    stable.throughput = generated.throughput_0;
    stable.metallic = generated.metallic_1;
    stable.specular = generated.specular_1;
    stable.ior = generated.ior_2;
    stable.iridescence = generated.iridescence_2;
    stable.iridescenceIor = generated.iridescenceIor_2;
    stable.iridescenceThickness = generated.iridescenceThickness_2;
    stable.dispersion = generated.dispersion_2;
    stable.thinWalled = generated.thinWalled_1;
    stable.attenuationColor = generated.attenuationColor_2;
    stable.attenuationDistance = generated.attenuationDistance_2;
    stable.multiscatterColor = generated.multiscatterColor_1;
    stable.scatterAnisotropy = generated.scatterAnisotropy_2;
    stable.transmissionWeight = generated.transmissionWeight_0;
    stable.diffuseTransmissionColor = generated.diffuseTransmissionColor_0;
    stable.diffuseTransmissionWeight = generated.diffuseTransmissionWeight_0;
    return stable;
}

TransportContext_0 pbrToGeneratedTransportContext(PbrTransport stable)
{
    TransportContext_0 generated;
    generated.currentMediumIor_1 = stable.currentMediumIor;
    generated.interfaceIor_0 = stable.interfaceIor;
    generated.thinWalled_2 = stable.thinWalled;
    generated._pad0_0 = stable._pad0;
    return generated;
}

PbrTransport pbrFromGeneratedTransportContext(TransportContext_0 generated)
{
    PbrTransport stable;
    stable.currentMediumIor = generated.currentMediumIor_1;
    stable.interfaceIor = generated.interfaceIor_0;
    stable.thinWalled = generated.thinWalled_2;
    stable._pad0 = generated._pad0_0;
    return stable;
}

DirectionContext_0 pbrToGeneratedDirectionContext(PbrDirections stable)
{
    DirectionContext_0 generated;
    generated.viewDir_18 = stable.viewDir;
    generated.lightDir_18 = stable.lightDir;
    return generated;
}

PbrDirections pbrFromGeneratedDirectionContext(DirectionContext_0 generated)
{
    PbrDirections stable;
    stable.viewDir = generated.viewDir_18;
    stable.lightDir = generated.lightDir_18;
    return stable;
}

NormalContext_0 pbrToGeneratedNormalContext(PbrNormals stable)
{
    NormalContext_0 generated;
    generated.rawGeometryNormal_0 = stable.rawGeometryNormal;
    generated.transmissionNormal_0 = stable.transmissionNormal;
    generated.baseNormal_3 = stable.baseNormal;
    generated.clearcoatNormal_2 = stable.clearcoatNormal;
    return generated;
}

PbrNormals pbrFromGeneratedNormalContext(NormalContext_0 generated)
{
    PbrNormals stable;
    stable.rawGeometryNormal = generated.rawGeometryNormal_0;
    stable.transmissionNormal = generated.transmissionNormal_0;
    stable.baseNormal = generated.baseNormal_3;
    stable.clearcoatNormal = generated.clearcoatNormal_2;
    return stable;
}

SampleRandoms_0 pbrToGeneratedSampleRandoms(PbrRandoms stable)
{
    SampleRandoms_0 generated;
    generated.component_0 = stable.component;
    generated.lobe_0 = stable.lobe;
    generated.boundary_0 = stable.boundary;
    return generated;
}

PbrRandoms pbrFromGeneratedSampleRandoms(SampleRandoms_0 generated)
{
    PbrRandoms stable;
    stable.component = generated.component_0;
    stable.lobe = generated.lobe_0;
    stable.boundary = generated.boundary_0;
    return stable;
}

BsdfSample_0 pbrToGeneratedBsdfSample(PbrSample stable)
{
    BsdfSample_0 generated;
    generated.direction_0 = stable.direction;
    generated.pdf_1 = stable.pdf;
    generated.bsdfOverPdf_0 = stable.bsdfOverPdf;
    generated.specular_2 = stable.specular;
    generated.crossedBoundary_0 = stable.crossedBoundary;
    generated.nextMediumIor_0 = stable.nextMediumIor;
    return generated;
}

PbrSample pbrFromGeneratedBsdfSample(BsdfSample_0 generated)
{
    PbrSample stable;
    stable.direction = generated.direction_0;
    stable.pdf = generated.pdf_1;
    stable.bsdfOverPdf = generated.bsdfOverPdf_0;
    stable.specular = generated.specular_2;
    stable.crossedBoundary = generated.crossedBoundary_0;
    stable.nextMediumIor = generated.nextMediumIor_0;
    return stable;
}

MaterialVolumeState_0 pbrToGeneratedMaterialVolumeState(PbrVolume stable)
{
    MaterialVolumeState_0 generated;
    generated.sigmaT_0 = stable.sigmaT;
    generated.isActive_0 = stable.isActive;
    generated.rhoSs_0 = stable.rhoSs;
    generated.scatterAnisotropy_4 = stable.scatterAnisotropy;
    generated.sigmaA_0 = stable.sigmaA;
    generated._pad0_1 = stable._pad0;
    return generated;
}

PbrVolume pbrFromGeneratedMaterialVolumeState(MaterialVolumeState_0 generated)
{
    PbrVolume stable;
    stable.sigmaT = generated.sigmaT_0;
    stable.isActive = generated.isActive_0;
    stable.rhoSs = generated.rhoSs_0;
    stable.scatterAnisotropy = generated.scatterAnisotropy_4;
    stable.sigmaA = generated.sigmaA_0;
    stable._pad0 = generated._pad0_1;
    return stable;
}

VolumePhaseSample_0 pbrToGeneratedVolumePhaseSample(PbrPhaseSample stable)
{
    VolumePhaseSample_0 generated;
    generated.direction_1 = stable.direction;
    generated.pdf_2 = stable.pdf;
    return generated;
}

PbrPhaseSample pbrFromGeneratedVolumePhaseSample(VolumePhaseSample_0 generated)
{
    PbrPhaseSample stable;
    stable.direction = generated.direction_1;
    stable.pdf = generated.pdf_2;
    return stable;
}

MaterialBsdfState_0 pbrToGeneratedMaterialBsdfState(PbrState stable)
{
    MaterialBsdfState_0 generated;
    generated.closure_1 = pbrToGeneratedSurfaceClosure(stable.closure);
    generated.currentMediumIor_0 = stable.currentMediumIor;
    return generated;
}

PbrClosure pbrBuildClosureFromGltf(PbrGltfMaterial material, PbrLayerNormals layerNormals, vec3 anisotropyTangent)
{
    return pbrFromGeneratedSurfaceClosure(buildPbrSurfaceClosure_0(buildPbrSurfaceFromGltf_0(pbrToGeneratedGltfPbrMaterial(material)), pbrToGeneratedSurfaceLayerNormals(layerNormals), anisotropyTangent));
}

MaterialBsdfState_0 pbrToGeneratedGltfMaterialBsdfState(PbrGltfState stable)
{
    MaterialBsdfState_0 generated;
    generated.closure_1 = pbrToGeneratedSurfaceClosure(stable.closure);
    generated.currentMediumIor_0 = stable.currentMediumIor;
    return generated;
}

PbrGltfState pbrPrepareStateFromGltf(PbrGltfMaterial material, PbrClosure closure, PbrTransport transport)
{
    PbrGltfState stable;
    stable.material = material;
    stable.closure = closure;
    stable.currentMediumIor = max(transport.currentMediumIor, 1.0);
    return stable;
}

vec3 pbrEvalGltfState(PbrGltfState state, PbrDirections directions, PbrNormals normals)
{
    return evalPbrBsdf_0(pbrToGeneratedGltfMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

float pbrPdfGltfState(PbrGltfState state, PbrDirections directions, PbrNormals normals)
{
    return pdfPbrBsdf_0(pbrToGeneratedGltfMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

PbrSample pbrSampleGltfState(PbrGltfState state, PbrDirections directions, PbrNormals normals, PbrRandoms randoms)
{
    return pbrFromGeneratedBsdfSample(samplePbrBsdf_0(pbrToGeneratedGltfMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals), pbrToGeneratedSampleRandoms(randoms)));
}

PbrVolume pbrPrepareVolumeFromGltfState(PbrGltfState state)
{
    return pbrFromGeneratedMaterialVolumeState(preparePbrVolumeState_0(pbrToGeneratedGltfMaterialBsdfState(state)));
}

PbrClosure pbrBuildClosure(PbrMaterial surface, PbrLayerNormals layerNormals, vec3 anisotropyTangent)
{
    return pbrFromGeneratedSurfaceClosure(buildPbrSurfaceClosure_0(pbrToGeneratedSurfaceMaterial(surface), pbrToGeneratedSurfaceLayerNormals(layerNormals), anisotropyTangent));
}

PbrState pbrPrepareState(PbrMaterial surface, PbrClosure closure, PbrTransport transport)
{
    PbrState stable;
    stable.surface = surface;
    stable.closure = closure;
    stable.currentMediumIor = max(transport.currentMediumIor, 1.0);
    return stable;
}

vec3 pbrEval(PbrState state, PbrDirections directions, PbrNormals normals)
{
    return evalPbrBsdf_0(pbrToGeneratedMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

float pbrPdf(PbrState state, PbrDirections directions, PbrNormals normals)
{
    return pdfPbrBsdf_0(pbrToGeneratedMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals));
}

PbrSample pbrSample(PbrState state, PbrDirections directions, PbrNormals normals, PbrRandoms randoms)
{
    return pbrFromGeneratedBsdfSample(samplePbrBsdf_0(pbrToGeneratedMaterialBsdfState(state), pbrToGeneratedDirectionContext(directions), pbrToGeneratedNormalContext(normals), pbrToGeneratedSampleRandoms(randoms)));
}

PbrVolume pbrClearVolume()
{
    return pbrFromGeneratedMaterialVolumeState(clearPbrVolumeState_0());
}

PbrVolume pbrEnterVolume(PbrVolume volume)
{
    return pbrFromGeneratedMaterialVolumeState(enterPbrVolumeState_0(pbrToGeneratedMaterialVolumeState(volume)));
}

PbrVolume pbrPrepareVolume(PbrState state)
{
    return pbrFromGeneratedMaterialVolumeState(preparePbrVolumeState_0(pbrToGeneratedMaterialBsdfState(state)));
}

vec3 pbrEvalTransmittance(PbrVolume volume, float distance)
{
    return evalPbrHomogeneousTransmittance_0(pbrToGeneratedMaterialVolumeState(volume), distance);
}

float pbrMediumEventPdf(PbrVolume volume, float distance)
{
    return pbrHomogeneousMediumEventPdf_0(pbrToGeneratedMaterialVolumeState(volume), distance);
}

float pbrMediumNoEventPdf(PbrVolume volume, float distance)
{
    return pbrHomogeneousMediumNoEventPdf_0(pbrToGeneratedMaterialVolumeState(volume), distance);
}

float pbrEvalPhase(PbrVolume volume, vec3 incidentDir, vec3 outgoingDir)
{
    return evalPbrVolumePhase_0(pbrToGeneratedMaterialVolumeState(volume), incidentDir, outgoingDir);
}

float pbrPdfPhase(PbrVolume volume, vec3 incidentDir, vec3 outgoingDir)
{
    return pdfPbrVolumePhase_0(pbrToGeneratedMaterialVolumeState(volume), incidentDir, outgoingDir);
}

PbrPhaseSample pbrSamplePhase(PbrVolume volume, vec3 incidentDir, vec2 randoms)
{
    return pbrFromGeneratedVolumePhaseSample(samplePbrVolumePhase_0(pbrToGeneratedMaterialVolumeState(volume), incidentDir, randoms));
}
`,kh=`PbrLayerNormals make_pbr_layer_normals(const in MaterialClosure c) {
  PbrLayerNormals normals;
  normals.rawGeometry = c.ng;
  normals.geometry = c.ng;
  normals.shadingGeometry = c.n;
  normals.interfaceBase = c.n;
  normals.base = c.n;
  normals.clearcoat = c.n;
  normals.anisotropyTangent = c.anisotropyTangent;
  return normals;
}

PbrGltfState make_pbr_gltf_state(const in MaterialClosure c) {
  PbrLayerNormals normals = make_pbr_layer_normals(c);
  PbrClosure closure = pbrBuildClosureFromGltf(c.material, normals, normals.anisotropyTangent);

  PbrTransport transport;
  transport.currentMediumIor = 1.0;
  transport.interfaceIor = c.material.ior;
  transport.thinWalled = c.thin_walled ? 1.0 : 0.0;
  transport._pad0 = 0.0;

  return pbrPrepareStateFromGltf(c.material, closure, transport);
}

PbrDirections make_pbr_directions(vec3 wi, vec3 wo) {
  PbrDirections directions;
  directions.viewDir = wi;
  directions.lightDir = wo;
  return directions;
}

PbrNormals make_pbr_normals(const in MaterialClosure c) {
  PbrNormals normals;
  normals.rawGeometryNormal = c.ng;
  normals.transmissionNormal = c.n;
  normals.baseNormal = c.n;
  normals.clearcoatNormal = c.n;
  return normals;
}

vec3 pbr_material_eval(const in MaterialClosure c, vec3 wi, vec3 wo) {
  vec3 bsdf_with_cos = pbrEvalGltfState(
    make_pbr_gltf_state(c),
    make_pbr_directions(wi, wo),
    make_pbr_normals(c)
  );
  return bsdf_with_cos / max(abs(dot(c.n, wo)), EPS);
}

vec3 pbr_material_sample(inout MaterialClosure c, vec3 wi, in vec3 uvw, inout vec3 bsdf_over_pdf, out float pdf) {
  PbrRandoms randoms;
  randoms.component = rng_float();
  randoms.lobe = uvw.xy;
  randoms.boundary = uvw.z;

  PbrSample bsdfSample = pbrSampleGltfState(
    make_pbr_gltf_state(c),
    make_pbr_directions(wi, vec3(0.0)),
    make_pbr_normals(c),
    randoms
  );

  pdf = bsdfSample.pdf;
  bsdf_over_pdf = bsdfSample.bsdfOverPdf;
  c.event_type = 0;
  if (bsdfSample.specular > 0.5 && c.material.roughnessFactor <= MINIMUM_ROUGHNESS) c.event_type |= E_DELTA;
  if (dot(bsdfSample.direction, c.ng) < 0.0) c.event_type |= E_TRANSMISSION;
  else c.event_type |= E_REFLECTION;
  return bsdfSample.direction;
}
`,Nh=`// BVH node format: tinybvh bvh_gpu layout
// Each node occupies 4 RGBA texels (16 floats), no header.
//   texel n*4+0: (lmin.x, lmin.y, lmin.z, left)   — left child bounds + child index
//   texel n*4+1: (lmax.x, lmax.y, lmax.z, right)  — left child bounds + right child index
//   texel n*4+2: (rmin.x, rmin.y, rmin.z, cnt)    — right child bounds + triangle count (>0 = leaf)
//   texel n*4+3: (rmax.x, rmax.y, rmax.z, first)  — right child bounds + first triangle index

const int BVH_STACK_SIZE = 64;
const int MAX_BVH_TRAVERSAL_STEPS = 4096;
const int MAX_BVH_LEAF_TRIANGLES = 64;

struct bvh_ray {
  vec3 dir;
  vec3 org;
  float tfar;
  vec3 inv_dir;
};

struct bvh_hit {
  int triIndex;
  float tfar;
  vec2 uv;
};

bvh_ray bvh_create_ray(in vec3 direction, in vec3 origin, in float tfar) {
  return bvh_ray(direction, origin, tfar, vec3(1.0) / direction);
}

// Returns tmin of intersection, or BVH_FAR if miss.
// Handles NaN (parallel rays, degenerate AABBs) safely via explicit isnan guard.
float bvh_intersect_bounds(const in vec3 bmin, const in vec3 bmax,
                           const in vec3 org, const in vec3 inv_dir, const in float tfar) {
  vec3 t0 = (bmin - org) * inv_dir;
  vec3 t1 = (bmax - org) * inv_dir;
  vec3 lo = min(t0, t1);
  vec3 hi = max(t0, t1);
  float tmin = max(max(lo.x, lo.y), lo.z);
  float tmax = min(min(hi.x, hi.y), hi.z);
  if (isnan(tmin) || isnan(tmax) || tmin > tmax || tmax < 0.0 || tmin >= tfar) return BVH_FAR;
  return tmin;
}

// Moeller-Trumbore triangle intersection.
bool intersectTriangle(const in bvh_ray r, in vec3 p0, in vec3 p1, in vec3 p2,
                       const in float tfar, out float t, out vec2 uv) {
  vec3 e0 = p1 - p0;
  vec3 e1 = p2 - p0;
  vec3 pvec = cross(r.dir, e1);
  float det = dot(e0, pvec);
  if (abs(det) < EPS) return false;
  float f = 1.0 / det;
  vec3 s = r.org - p0;
  float u = f * dot(s, pvec);
  if (u < 0.0 || u > 1.0) return false;
  vec3 qvec = cross(s, e0);
  float v = f * dot(r.dir, qvec);
  if (v < 0.0 || u + v > 1.0) return false;
  t = f * dot(e1, qvec);
  if (t < EPS || t >= tfar) return false;
  uv = vec2(u, v);
  return true;
}

// --- Fetch a node texel (4 floats) from the BVH data texture.
// Node ni, texel offset within node [0..3].
vec4 bvh_fetch(int ni, int off) {
  int ti = ni * 4 + off;
  return texelFetch(u_sampler_bvh, ivec2(ti % int(MAX_TEXTURE_SIZE), ti / int(MAX_TEXTURE_SIZE)), 0);
}

// --- Fetch a remapped triangle index from the BVH index texture.
int get_mesh_triangle_index(int bvhTriIndex) {
  if (bvhTriIndex < 0 || bvhTriIndex >= NUM_BVH_INDICES) return -1;
  return int(texelFetch(u_sampler_bvh_index,
    ivec2(bvhTriIndex % int(MAX_TEXTURE_SIZE), bvhTriIndex / int(MAX_TEXTURE_SIZE)), 0).x);
}

int get_triangle_vertex_index(uint triIndex, uint corner) {
  uint indexOffset = triIndex * TRIANGLE_INDEX_STRIDE + corner;
  return int(texelFetch(u_sampler_triangle_indices,
    ivec2(int(indexOffset % MAX_TEXTURE_SIZE), int(indexOffset / MAX_TEXTURE_SIZE)), 0).x);
}

vec4 fetch_vertex(uint triIndex, uint corner, uint attributeOffset) {
  int vertexIndex = get_triangle_vertex_index(triIndex, corner);
  uint texel = uint(vertexIndex) * VERTEX_STRIDE + attributeOffset;
  return texelFetch(u_sampler_triangle_data,
    ivec2(int(texel % MAX_TEXTURE_SIZE), int(texel / MAX_TEXTURE_SIZE)), 0);
}

uint get_material_idx(const uint triIndex) {
  return uint(fetch_vertex(triIndex, 0u, POSITION_OFFSET).w);
}

void get_triangle(const in uint index, out vec3 p0, out vec3 p1, out vec3 p2) {
  p0 = fetch_vertex(index, 0u, POSITION_OFFSET).xyz;
  p1 = fetch_vertex(index, 1u, POSITION_OFFSET).xyz;
  p2 = fetch_vertex(index, 2u, POSITION_OFFSET).xyz;
}

vec3 compute_interpolated_normal(const in uint index, const in vec2 uv) {
  vec3 n0 = fetch_vertex(index, 0u, NORMAL_OFFSET).xyz;
  vec3 n1 = fetch_vertex(index, 1u, NORMAL_OFFSET).xyz;
  vec3 n2 = fetch_vertex(index, 2u, NORMAL_OFFSET).xyz;
  return normalize((1.0 - uv.x - uv.y) * n0 + uv.x * n1 + uv.y * n2);
}

vec2 compute_interpolated_uv(const in uint index, const in vec2 hit_uv, int set) {
  vec4 uv0 = fetch_vertex(index, 0u, UV_OFFSET);
  vec4 uv1 = fetch_vertex(index, 1u, UV_OFFSET);
  vec4 uv2 = fetch_vertex(index, 2u, UV_OFFSET);
  if (set == 0)
    return (1.0 - hit_uv.x - hit_uv.y) * uv0.xy + hit_uv.x * uv1.xy + hit_uv.y * uv2.xy;
  else
    return (1.0 - hit_uv.x - hit_uv.y) * uv0.zw + hit_uv.x * uv1.zw + hit_uv.y * uv2.zw;
}

vec4 compute_interpolated_tangent(const in uint index, const in vec2 uv, vec3 n) {
  vec4 t0 = fetch_vertex(index, 0u, TANGENT_OFFSET);
  vec4 t1 = fetch_vertex(index, 1u, TANGENT_OFFSET);
  vec4 t2 = fetch_vertex(index, 2u, TANGENT_OFFSET);
  float handedness = (t0.w == t1.w && t0.w == t2.w) ? t0.w : 0.0;
  vec3 tangent = normalize((1.0 - uv.x - uv.y) * t0.xyz + uv.x * t1.xyz + uv.y * t2.xyz);
  if (length(tangent) > 0.99 && abs(handedness) > 0.99)
    return vec4(tangent, -handedness);
  return vec4(get_onb(n)[0], 1.0);
}

vec4 calculateInterpolatedVertexColors(const in uint index, const in vec2 hit_uv) {
  vec4 c0 = fetch_vertex(index, 0u, COLOR_OFFSET);
  vec4 c1 = fetch_vertex(index, 1u, COLOR_OFFSET);
  vec4 c2 = fetch_vertex(index, 2u, COLOR_OFFSET);
  return (1.0 - hit_uv.x - hit_uv.y) * c0 + hit_uv.x * c1 + hit_uv.y * c2;
}

// --- tinybvh bvh_gpu traversal ---
bool bvh_valid_node(int ni) {
  return ni >= 0 && ni < NUM_BVH_NODES;
}

void bvh_push_child(inout int stack[BVH_STACK_SIZE], inout int top, int child, int parent) {
  if (top < BVH_STACK_SIZE && bvh_valid_node(child) && child != parent) {
    stack[top++] = child;
  }
}

// Stack-pop traversal with a hard iteration cap. This avoids GPU watchdog hangs
// if malformed BVH data creates a cycle or an unexpectedly deep tree.
bool intersectSceneTriangles_BVH(const in bvh_ray r, out bvh_hit hit) {
  hit.tfar     = r.tfar;
  hit.triIndex = -1;

  int stack[BVH_STACK_SIZE];
  int top  = 1;
  stack[0] = 0; // push root (node 0)

  for (int step = 0; step < MAX_BVH_TRAVERSAL_STEPS && top > 0; step++) {
    int ni = stack[--top];
    if (!bvh_valid_node(ni)) continue;

    vec4 n0 = bvh_fetch(ni, 0); // (lmin.xyz, left)
    vec4 n1 = bvh_fetch(ni, 1); // (lmax.xyz, right)
    vec4 n2 = bvh_fetch(ni, 2); // (rmin.xyz, cnt)
    vec4 n3 = bvh_fetch(ni, 3); // (rmax.xyz, first)

    int cnt   = int(n2.w);
    int first = int(n3.w);

    if (cnt > 0) {
      // Leaf: test triangles [first, first + cnt)
      int end = min(first + min(cnt, MAX_BVH_LEAF_TRIANGLES), NUM_BVH_INDICES);
      for (int i = first; i < end; i++) {
        int idx = get_mesh_triangle_index(i);
        if (idx < 0 || idx >= int(NUM_TRIANGLES)) continue;
        vec3 p0, p1, p2;
        get_triangle(uint(idx), p0, p1, p2);
        float t; vec2 uv;
        if (intersectTriangle(r, p0, p1, p2, hit.tfar, t, uv)) {
          hit.tfar     = t;
          hit.triIndex = idx;
          hit.uv       = uv;
        }
      }
    } else {
      // Internal: test both child AABBs, push hit children (farther first)
      int  left  = int(n0.w);
      int  right = int(n1.w);
      vec3 lmin  = n0.xyz, lmax = n1.xyz;
      vec3 rmin  = n2.xyz, rmax = n3.xyz;

      float d0 = bvh_intersect_bounds(lmin, lmax, r.org, r.inv_dir, hit.tfar);
      float d1 = bvh_intersect_bounds(rmin, rmax, r.org, r.inv_dir, hit.tfar);

      // Push farther child first so nearer is processed next (front-to-back)
      if (d0 < BVH_FAR && d1 < BVH_FAR) {
        if (d0 < d1) {
          bvh_push_child(stack, top, right, ni);
          bvh_push_child(stack, top, left, ni);
        } else {
          bvh_push_child(stack, top, left, ni);
          bvh_push_child(stack, top, right, ni);
        }
      } else if (d0 < BVH_FAR) {
        bvh_push_child(stack, top, left, ni);
      } else if (d1 < BVH_FAR) {
        bvh_push_child(stack, top, right, ni);
      }
    }
  }

  return hit.triIndex >= 0;
}

bool bvh_intersect_nearest(const in bvh_ray r, out bvh_hit hit) {
  return intersectSceneTriangles_BVH(r, hit);
}

bool isVisible(const in vec3 p0, const in vec3 p1) {
  vec3 d = p1 - p0;
  bvh_ray r = bvh_create_ray(normalize(d), p0, length(d));
  bvh_hit hit;
  return !bvh_intersect_nearest(r, hit);
}

bool isOccluded(const in vec3 p0, const in vec3 dir) {
  bvh_ray r = bvh_create_ray(normalize(dir), p0, TFAR_MAX);
  bvh_hit hit;
  return bvh_intersect_nearest(r, hit);
}
`,jh=`// For now, we only have 1 point light
vec3 sampleAndEvaluatePointLight(const in RenderState rs) {
  if (u_point_light_position.w <= 0.5) return vec3(0.0);

  vec3 pointLightPosition = u_point_light_position.xyz;
  vec3 pointLightEmission = u_point_light_emission.xyz;
  vec3 light_dir = pointLightPosition - rs.hitPos;
  float dist2 = dot(light_dir, light_dir);
  light_dir = normalize(light_dir);

  vec3 n =  rs.closure.backside ? -rs.closure.n : rs.closure.n;
  float cosNL = saturate(dot(light_dir, n));

  bool isVisible = isVisible(rs.hitPos, pointLightPosition);

  vec3 L = vec3(0.0);
  if (cosNL > EPS_COS && isVisible) {
    L = pbr_material_eval(rs.closure, rs.wi, light_dir) * (pointLightEmission / dist2) * cosNL;
  }

  return L;
}

int sampleRow1D(sampler2D pdf, sampler2D cdf, int row, int size, inout float r, out float prop) {
  int idx = lower_bound(cdf, row, size, r);
  prop = texelFetch(pdf, ivec2(idx, row), 0).x;

  return (idx >= size) ? (size - 1) : idx;
}


ivec2 ibl_sample_pixel(float r0, float r1, out float o_sample_pdf) {
  float pdfY = 1.0;
  float pdfX = 1.0;
  int w = int(u_ibl_resolution.x);
  int h = int(u_ibl_resolution.y);
  int y = sampleRow1D(u_sampler_env_map_yPdf, u_sampler_env_map_yCdf, 0, h, r1, pdfY);
  int x = sampleRow1D(u_sampler_env_map_pdf, u_sampler_env_map_cdf, y, w, r0, pdfX);

  o_sample_pdf = u_ibl_resolution.x * u_ibl_resolution.y * pdfY * pdfX;
  return ivec2(x, y);
}


float ibl_pdf_pixel(ivec2 xy) {
  float w = u_ibl_resolution.x;
  float h = u_ibl_resolution.y;
  return w * h * texelFetch(u_sampler_env_map_yPdf, ivec2(xy.y, 0), 0).x *
    texelFetch(u_sampler_env_map_pdf, ivec2(xy.x, xy.y), 0).x;
}

vec3 ibl_eval_pixel(ivec2 xy) {
  return texelFetch(u_sampler_env_map, xy, 0).xyz;
}

vec3 rotate_dir_phi(vec3 dir, bool inverse) {
  float angle = inverse ? -u_ibl_rotation : u_ibl_rotation;
  mat3 m = mat3(
    cos(angle), 0.0, sin(angle),
    0.0, 1.0, 0.0,
    -sin(angle), 0.0, cos(angle));
  return m * dir;
}


vec3 ibl_eval(vec3 dir) {
  float pdf;
  vec3 sample_dir = rotate_dir_phi(dir, false);
  vec2 uv = dir_to_uv(sample_dir, pdf);
  return texture(u_sampler_env_map, uv).xyz;
}


vec3 ibl_sample_direction(float r0, float r1, out float o_sample_pdf) {
  float sample_pdf;
  ivec2 xy = ibl_sample_pixel(r0, r1, sample_pdf);
  vec2 uv = vec2(xy) / u_ibl_resolution;

  float pdf_w;
  vec3 sample_dir = rotate_dir_phi(uv_to_dir(uv, pdf_w), true);
  o_sample_pdf = sample_pdf * pdf_w;

  return sample_dir;
}


float ibl_pdf(vec3 dir) {
  float pdf_w;
  vec3 sample_dir = rotate_dir_phi(dir, false);
  vec2 uv = dir_to_uv(sample_dir, pdf_w);
  float w = u_ibl_resolution.x;
  float h = u_ibl_resolution.y;

  float x = min((uv.x) * w, u_ibl_resolution.x - 1.0);
  float y = min((uv.y) * h, u_ibl_resolution.y - 1.0);
  return w * h * texelFetch(u_sampler_env_map_yPdf, ivec2(y, 0), 0).x *
         texelFetch(u_sampler_env_map_pdf, ivec2(x, y), 0).x * pdf_w;
}
`,Bh=`#version 300 es
precision highp int;
precision highp float;
precision highp sampler2D;
precision highp isampler2D;
precision highp sampler2DArray;

in vec2 v_uv;

 layout(std140) uniform PathTracingUniformBlock {
    mat4  u_u_view_mat;
    vec4  u_background_color;
    vec4  u_camera_pos;
    vec2  u_inv_render_res;
    vec2  u_ibl_resolution;
    float u_frame_count;
    float u_debug_mode;
    float u_uniform_pad1;
    float u_use_ibl;
    float u_ibl_rotation;
    float u_background_from_ibl;
    float u_max_bounces;
    float u_focal_length;
    float u_ibl_pdf_total_sum;
    float u_ray_eps;
    float u_clamp_threshold;
    float u_uniform_pad0;
    vec4  u_scene_counts;
    vec4  u_point_light_position;
    vec4  u_point_light_emission;
};

uniform sampler2D u_sampler2D_PreviousTexture;

// Pathracing data buffers
uniform sampler2D u_sampler_triangle_data;
uniform isampler2D u_sampler_triangle_indices;
uniform sampler2D u_sampler_bvh;
uniform isampler2D u_sampler_bvh_index;

// Env map buffers
uniform sampler2D u_sampler_env_map;
uniform sampler2D u_sampler_env_map_pdf;
uniform sampler2D u_sampler_env_map_cdf;
uniform sampler2D u_sampler_env_map_yPdf;
uniform sampler2D u_sampler_env_map_yCdf;


layout(location = 0) out vec4 out_FragColor;

#include <pbr_kernel>
#include <structs>
#include <buffer_accessor>
#include <texture_accessor>
#include <rng>
#include <constants>
#include <lights>
#include <utils>

#include <material_block>
#include <material>

#include <mesh_constants>
#include <bvh>

#include <pbr_material_adapter>
#include <lighting>

///////////////////////////////////////////////////////////////////////////////
// Pathtracing Integrator Common
///////////////////////////////////////////////////////////////////////////////
void fillRenderState(const in bvh_ray r, const in bvh_hit hit, out RenderState rs) {
  rs.hitPos = r.org + r.dir * hit.tfar;

  uint triIdx = uint(hit.triIndex);

  rs.wi = -r.dir;

  vec3 p0, p1, p2;
  get_triangle(triIdx, p0, p1, p2);
  rs.ng = compute_triangle_normal(p0, p1, p2);
  rs.n = compute_interpolated_normal(triIdx, hit.uv);

  rs.uv0 = compute_interpolated_uv(triIdx, hit.uv, 0);
  rs.tangent = compute_interpolated_tangent(triIdx, hit.uv, rs.n);

  vec4 vertexColor = calculateInterpolatedVertexColors(triIdx, hit.uv);

  uint matIdx = get_material_idx(triIdx);
  configure_gltf_material(matIdx, rs, rs.closure, vertexColor);
}


bool sample_bsdf_bounce(inout RenderState rs, out vec3 sampleWeight, out float pdf) {
  bool ignoreBackfaces = false;//(!rs.closure.double_sided && rs.closure.backside);

  pdf = 1.0;
  sampleWeight = vec3(1.0);
  if (rng_float() > rs.closure.cutout_opacity || ignoreBackfaces) {
    rs.closure.event_type |= E_DELTA;
    rs.wo = -rs.wi;
  } else {
    rs.wo = pbr_material_sample(rs.closure, rs.wi,
                                vec3(rng_float(), rng_float(), rng_float()),
                                sampleWeight, pdf);

    if (pdf < EPS_PDF) {
      sampleWeight = vec3(0.0);
      pdf = 0.0;
      return false; // teminate path
    }
  }

  rs.hitPos = rs.hitPos + fix_normal(rs.ng, rs.wo) * u_ray_eps;
   return true;
}


bool check_russian_roulette_path_termination(int bounce, inout vec3 path_weight)
{
  path_weight *= 1.0 / (1.0 - RR_TERMINATION_PROB);
  return (bounce > RR_START_DEPTH) && (rng_float() <= RR_TERMINATION_PROB) ? true : false;
}


///////////////////////////////////////////////////////////////////////////////
// Ray Generation
///////////////////////////////////////////////////////////////////////////////
bvh_ray calcuateViewRay(float r0, float r1) {
  // box filter
  vec2 pixelOffset = vec2(r0, r1) * u_inv_render_res;

  float aspect = u_inv_render_res.y / u_inv_render_res.x;

  vec2 uv = (v_uv * vec2(aspect, 1.0) + pixelOffset) * u_camera_pos.w;
  vec3 fragPosView = normalize(vec3(uv.x, uv.y, -u_focal_length));

  fragPosView = mat3(u_u_view_mat) * fragPosView;
  vec3 origin = u_camera_pos.xyz;

  return bvh_create_ray(fragPosView, origin, TFAR_MAX);
}

#include <integrator>

void main() {
  rng_init(int(u_frame_count) * int(u_max_bounces));

  bvh_ray r = calcuateViewRay(rng_float(), rng_float());

  vec4 contribution = trace(r);

  vec4 previousFrameColor = texelFetch(u_sampler2D_PreviousTexture, ivec2(gl_FragCoord.xy), 0);
  contribution = (previousFrameColor * (u_frame_count - 1.0) + contribution) / u_frame_count;

  out_FragColor = contribution;
}
`,Oh=`const int D_ALBEDO = 1;
const int D_METAL = 2;
const int D_ROUGHNESS = 3;
const int D_NORMAL = 4;
const int D_TANGENT = 5;
const int D_BITANGENT = 6;
const int D_TRANSPARENCY = 7;
const int D_UV0 = 8;
const int D_CLEARCOAT = 9;
const int D_IBL_PDF = 10;
const int D_IBL_CDF = 11;
const int D_SPECULAR = 12;
const int D_SPECULAR_TINT = 13;
const int D_TRANSLUCENCY = 14;

vec4 trace(const bvh_ray ray) {
  bvh_hit hit;

  vec4 color = vec4(0);
  if (bvh_intersect_nearest(ray, hit)) {
    vec3 contrib = vec3(0);
    RenderState rs;
    fillRenderState(ray, hit, rs);

    MaterialClosure c = rs.closure;

    if (int(u_debug_mode) == D_ALBEDO) {
      contrib = c.material.baseColorFactor.rgb;
    }
    if (int(u_debug_mode) == D_METAL)
      contrib = vec3(c.material.metallicFactor);
    if (int(u_debug_mode) == D_ROUGHNESS)
      contrib = vec3(c.material.roughnessFactor);
    if (int(u_debug_mode) == D_NORMAL)
      contrib = c.n;
    if (int(u_debug_mode) == D_TANGENT) {
      contrib = c.t.xyz;
    }
    if (int(u_debug_mode) == D_BITANGENT) {
      Geometry g = calculateBasis(c.n, c.t);
      contrib = g.b;
    }
    if (int(u_debug_mode) == D_TRANSPARENCY) {
      contrib = vec3(c.material.transmissionFactor);
    }
     if (int(u_debug_mode) == D_TRANSLUCENCY) {
      contrib = c.material.diffuseTransmissionFactor * c.material.diffuseTransmissionColorFactor;
    }
    if (int(u_debug_mode) == D_UV0) {
      contrib = vec3(rs.uv0, 0.0);
    }
    if (int(u_debug_mode) == D_CLEARCOAT) {
      contrib = vec3(c.material.clearcoatFactor);
    }
    if (int(u_debug_mode) == D_SPECULAR) {
      contrib = vec3(c.material.specularFactor);
    }
    if (int(u_debug_mode) == D_SPECULAR_TINT) {
      contrib = c.material.specularColorFactor;
    }
    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_background_from_ibl > 0.0) {
      if(int(u_debug_mode) == D_IBL_PDF) {
        vec3 sampleDir = rotate_dir_phi(ray.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map_pdf, dir_to_uv(sampleDir, pdf)).xyz, 1.0) * 10.0;
      }
      else if(int(u_debug_mode) == D_IBL_CDF) {
        vec3 sampleDir = rotate_dir_phi(ray.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map_cdf, dir_to_uv(sampleDir, pdf)).xyz, 1.0);
      }
      else {
        vec3 sampleDir = rotate_dir_phi(ray.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map, dir_to_uv(sampleDir, pdf)).xyz, 1.0);
      }
    }
  }

  return color;
}
`,Vh=`
vec3 eval_direct_light_contribution(in RenderState rs, float r0, float r1) {
  float ibl_sample_pdf;
  vec3 ibl_sample_dir;
  vec3 L = vec3(0);

  vec3 n = rs.closure.backside ? -rs.closure.n : rs.closure.n;

  if (u_use_ibl > 0.0) {
    ibl_sample_dir = ibl_sample_direction(r0, r1, ibl_sample_pdf);

    float cosNL = saturate(dot(ibl_sample_dir, n));
    if (cosNL > EPS_COS && ibl_sample_pdf > EPS_PDF) {
      if (!isOccluded(rs.hitPos, ibl_sample_dir)) {
        PbrGltfState bsdf_state = make_pbr_gltf_state(rs.closure);
        PbrDirections directions = make_pbr_directions(rs.wi, ibl_sample_dir);
        PbrNormals normals = make_pbr_normals(rs.closure);
        vec3 bsdf = pbrEvalGltfState(bsdf_state, directions, normals) / max(abs(dot(rs.closure.n, ibl_sample_dir)), EPS);
        float brdf_sample_pdf = pbrPdfGltfState(bsdf_state, directions, normals);
        L = ibl_eval(ibl_sample_dir) * bsdf * cosNL / ibl_sample_pdf;

        if (brdf_sample_pdf > EPS_PDF) {
          float mis_weight = mis_balance_heuristic(ibl_sample_pdf, brdf_sample_pdf);
          L *= mis_weight;
        }
      }
    }
  }

  L += sampleAndEvaluatePointLight(rs); // point light contribution is always evaluated
  return L;
}

vec4 trace(bvh_ray ray) {

  bvh_hit hit;
  vec3 path_weight = vec3(1.0);
  vec3 L = vec3(0.0);
  float last_bounce_pdf = 0.0;

  if (!bvh_intersect_nearest(ray, hit)) { // primary camera ray
    if (u_background_from_ibl > 0.0)
      return vec4(ibl_eval(ray.dir) * path_weight, 1.0);
    else
      return vec4(pow(u_background_color.xyz, vec3(2.2)), u_background_color.w);
  }

  RenderState rs;
  fillRenderState(ray, hit, rs);

  int bounce = 0;
  const int maxSpecularBounces = 32;
  bool last_bounce_specular = false; // pinhole camera is considered singular
  while (bounce < int(u_max_bounces) || (last_bounce_specular && (bounce < maxSpecularBounces)) )
  {
    if (check_russian_roulette_path_termination(bounce, path_weight))
      break;

    // Absorption
    if (rs.closure.backside && !rs.closure.thin_walled) {
      vec3 absorption_sigma = -log(rs.closure.material.attenuationColor) / rs.closure.material.attenuationDistance;
      path_weight *= exp(-absorption_sigma * hit.tfar);
    }

    L += rs.closure.material.emissiveFactor * rs.closure.material.emissiveStrength * path_weight;
    last_bounce_specular = bool(rs.closure.event_type & E_DELTA);

    vec3 bounce_weight;
    if (!sample_bsdf_bounce(rs, bounce_weight, last_bounce_pdf))
      return vec4(L, 1.0); // absorped

    if (!last_bounce_specular) {
      L += eval_direct_light_contribution(rs, rng_float(), rng_float()) * path_weight;
    }

    path_weight *= bounce_weight;

    ray = bvh_create_ray(rs.wo, rs.hitPos, TFAR_MAX);

    if (bvh_intersect_nearest(ray, hit)) { // primary camera ray
      fillRenderState(ray, hit, rs);
      bounce++;
    } else {
      float ibl_sample_pdf = ibl_pdf(ray.dir);
      float mis_weight = last_bounce_specular ? 1.0 : mis_balance_heuristic(last_bounce_pdf, ibl_sample_pdf);
      L += ibl_eval(ray.dir) * path_weight * mis_weight * u_use_ibl;

      bounce = 1337;
    }
  }

  return u_clamp_threshold > 0.0 ? vec4(clamp(L, 0.0, u_clamp_threshold), 1.0) : vec4(L, 1.0);
}
`;let dn=` #version 300 es
layout(location = 0) in vec4 position;
out vec2 v_uv;

void main()
{
  v_uv = position.xy;
  gl_Position = position;
}`;class Lh{constructor(){y(this,"pdf",null);y(this,"cdf",null);y(this,"yPdf",null);y(this,"yCdf",null);y(this,"width",0);y(this,"height",0);y(this,"totalSum",0)}}class u0{constructor(e={}){y(this,"gl");y(this,"canvas");y(this,"scene");y(this,"gpu_scene");y(this,"ibl",null);y(this,"iblImportanceSamplingData",new Lh);y(this,"fbos",new Map);y(this,"renderBuffers",new Map);y(this,"quadVao",null);y(this,"renderPrograms",new Map);y(this,"renderProgramPromises",new Map);y(this,"renderShaderMaps",new Map);y(this,"uniformLocations",new WeakMap);y(this,"uniformBlockIndices",new WeakMap);y(this,"renderProgram",null);y(this,"copyProgram",null);y(this,"fxaaProgram",null);y(this,"tonemapProgram",null);y(this,"displayProgram",null);y(this,"quadVertexBuffer",null);y(this,"renderRes",[0,0]);y(this,"displayRes",[0,0]);y(this,"_frameCount",1);y(this,"_isRendering",!1);y(this,"_resetAccumulation",!1);y(this,"schedulerMode","stopped");y(this,"framePending",!1);y(this,"frameHandle",0);y(this,"frameHandleKind",null);y(this,"tileIndex",0);y(this,"tileOrders",new Map);y(this,"materialProfile","webgl-lean");y(this,"currentCamera",null);y(this,"currentNumSamples",-1);y(this,"tileFinishedCB",()=>{});y(this,"frameFinishedCB",()=>{});y(this,"renderingFinishedCB");y(this,"diagnostics",{backend:"webgl2",sampleCount:0,mode:"stopped",renderResolution:"0x0",displayResolution:"0x0",tileResolution:1,framePending:!1,profiling:{},shaderPrograms:[]});y(this,"_exposure",1);y(this,"debugModes",["None","Albedo","Metalness","Roughness","Normals","Tangents","Bitangents","Transparency","UV0","Clearcoat","IBL PDF","IBL CDF","Specular","SpecularTint","Translucency"]);y(this,"_debugMode","None");y(this,"tonemappingModes",["None","Reinhard","Cineon","AcesFilm"]);y(this,"_tonemapping","None");y(this,"_maxBounces",8);y(this,"_useIBL",!0);y(this,"_showBackground",!0);y(this,"_forceIBLEval",!1);y(this,"_enableGamma",!0);y(this,"_iblRotation",0);y(this,"_pixelRatio",1);y(this,"_backgroundColor",[0,0,0,1]);y(this,"_rayEps",1e-4);y(this,"_enableFxaa",!1);y(this,"_tileRes",4);y(this,"_clampThreshold",3);y(this,"pathtracingUniformBuffer");y(this,"pathTracingUniforms",{u_u_view_mat:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],u_background_color:[0,0,0,1],u_camera_pos:[0,0,0,0],u_inv_render_res:[0,0],u_ibl_resolution:[0,0],u_frame_count:0,u_debug_mode:0,u_uniform_pad1:0,u_use_ibl:0,u_ibl_rotation:0,u_background_from_ibl:0,u_max_bounces:0,u_focal_length:0,u_ibl_pdf_total_sum:0,u_ray_eps:0,u_clamp_threshold:0,u_uniform_pad0:0,u_scene_counts:[0,0,0,0],u_point_light_position:[0,0,0,0],u_point_light_emission:[0,0,0,0]});y(this,"_bvhDataTexture");y(this,"_bvhIndexTexture");y(this,"_bvhNodeCount",0);y(this,"_bvhIndexCount",0);this.canvas=e.canvas?e.canvas:document.createElementNS("http://www.w3.org/1999/xhtml","canvas"),this.materialProfile=e.materialProfile??"webgl-lean";const t=e.context?e.context:this.canvas.getContext("webgl2",{alpha:!0,powerPreference:"high-performance"});this.gl=t,t.getExtension("EXT_color_buffer_float"),t.getExtension("OES_texture_float_linear"),this.pathtracingUniformBuffer=t.createBuffer(),t.bindBuffer(t.UNIFORM_BUFFER,this.pathtracingUniformBuffer),t.bindBufferBase(t.UNIFORM_BUFFER,0,this.pathtracingUniformBuffer),t.bindBuffer(t.UNIFORM_BUFFER,null),this.resize(Math.floor(this.canvas.width),Math.floor(this.canvas.height)),this.initFullscreenQuad()}get exposure(){return this._exposure}set exposure(e){this._exposure=e,this.resetAccumulation()}get debugMode(){return this._debugMode}set debugMode(e){this._debugMode=e,console.log(e),this.resetAccumulation()}get tonemapping(){return this._tonemapping}set tonemapping(e){this._tonemapping=e}get maxBounces(){return this._maxBounces}set maxBounces(e){this._maxBounces=e,this.resetAccumulation()}get useIBL(){return this._useIBL}set useIBL(e){this._useIBL=e,this.resetAccumulation()}get showBackground(){return this._showBackground}set showBackground(e){this._showBackground=e,this.resetAccumulation()}get forceIBLEval(){return this._forceIBLEval}set forceIBLEval(e){this._forceIBLEval=e,this.resetAccumulation()}get enableGamma(){return this._enableGamma}set enableGamma(e){this._enableGamma=e,this.resetAccumulation()}get iblRotation(){return this._iblRotation/Math.PI*180}set iblRotation(e){this._iblRotation=e/180*Math.PI,this.resetAccumulation()}get pixelRatio(){return this._pixelRatio}set pixelRatio(e){this._pixelRatio=e,this.resize(this.canvas.width,this.canvas.height)}get backgroundColor(){return this._backgroundColor}set backgroundColor(e){this._backgroundColor=e,this.resetAccumulation()}get rayEps(){return this._rayEps}set rayEps(e){this._rayEps=e,this.resetAccumulation()}get enableFxaa(){return this._enableFxaa}set enableFxaa(e){this._enableFxaa=e}set tileRes(e){this._tileRes=Math.max(2,Math.floor(e)||2)}get tileRes(){return this._tileRes}set clampThreshold(e){this._clampThreshold=e,this.resetAccumulation()}get clampThreshold(){return this._clampThreshold}resetAccumulation(){this._resetAccumulation=!0,this._frameCount=1,this.tileIndex=0,this._isRendering&&this.schedulerMode==="accumulating"&&(this.schedulerMode="settling"),this.updateDiagnostics(),this._isRendering&&this.scheduleFrame()}stopRendering(){this.frameHandle&&(this.frameHandleKind==="timeout"?clearTimeout(this.frameHandle):cancelAnimationFrame(this.frameHandle)),this.frameHandle=0,this.frameHandleKind=null,this.framePending=!1,this._isRendering=!1,this.schedulerMode="stopped",this.updateDiagnostics()}setInteractionMode(e){e?this.schedulerMode="interactive":this.schedulerMode!=="stopped"&&(this.schedulerMode="settling"),this.tileIndex=0,this.resetAccumulation(),this.updateDiagnostics()}resize(e,t){this.displayRes=[e,t],this.renderRes[0]=Math.ceil(this.displayRes[0]*this._pixelRatio),this.renderRes[1]=Math.ceil(this.displayRes[1]*this._pixelRatio),this.initFramebuffers(),this.resetAccumulation(),this.updateDiagnostics()}updatePathracingUniforms(e){var i,o;const t=this.renderRes;let a=Math.tan(e.fov*.5*Math.PI/180)*e.near;this.pathTracingUniforms.u_u_view_mat=Array.from(e.matrixWorld.elements),this.pathTracingUniforms.u_camera_pos=[e.position.x,e.position.y,e.position.z,a],this.pathTracingUniforms.u_frame_count=this._frameCount,this.pathTracingUniforms.u_debug_mode=this.debugModes.indexOf(this._debugMode),this.pathTracingUniforms.u_use_ibl=this.useIBL?1:0,this.pathTracingUniforms.u_ibl_rotation=this._iblRotation,this.pathTracingUniforms.u_background_from_ibl=this.showBackground?1:0,this.pathTracingUniforms.u_background_color=this.backgroundColor,this.pathTracingUniforms.u_max_bounces=this.maxBounces,this.pathTracingUniforms.u_ibl_resolution=[this.iblImportanceSamplingData.width,this.iblImportanceSamplingData.height],this.pathTracingUniforms.u_inv_render_res=[1/t[0],1/t[1]],this.pathTracingUniforms.u_focal_length=e.near,this.pathTracingUniforms.u_ray_eps=this.rayEps,this.pathTracingUniforms.u_ibl_pdf_total_sum=this.iblImportanceSamplingData.totalSum,this.pathTracingUniforms.u_clamp_threshold=this.clampThreshold,this.pathTracingUniforms.u_scene_counts=[((i=this.gpu_scene)==null?void 0:i.sceneData.num_triangles)??0,this._bvhNodeCount,this._bvhIndexCount,0];const r=(o=this.gpu_scene)==null?void 0:o.sceneData.lights[0];this.pathTracingUniforms.u_point_light_position=r?[r.position[0],r.position[1],r.position[2],1]:[0,0,0,0],this.pathTracingUniforms.u_point_light_emission=r?[r.emission[0],r.emission[1],r.emission[2],1]:[0,0,0,0];const s=new Float32Array(Object.values(this.pathTracingUniforms).flatMap(l=>Array.isArray(l)?l:[l]));if(this.gl.bindBuffer(this.gl.UNIFORM_BUFFER,this.pathtracingUniformBuffer),this.gl.bufferData(this.gl.UNIFORM_BUFFER,s,this.gl.STATIC_DRAW),this.gl.bindBuffer(this.gl.UNIFORM_BUFFER,null),this.scene&&this.gpu_scene)for(let l=0;l<this.scene.materials.length;l++)this.scene.materials[l].dirty&&(this.gpu_scene.updateMaterial(l),this.scene.materials[l].dirty=!1,this.resetAccumulation())}bindTextures(e){var s,i;let t=this.gl;const a=this.renderProgram;let r=e;t.useProgram(a),t.activeTexture(t.TEXTURE0+r),t.bindTexture(t.TEXTURE_2D,this.ibl),t.uniform1i(this.getUniformLocation(a,"u_sampler_env_map"),r++),t.activeTexture(t.TEXTURE0+r),t.bindTexture(t.TEXTURE_2D,this.iblImportanceSamplingData.pdf),t.uniform1i(this.getUniformLocation(a,"u_sampler_env_map_pdf"),r++),t.activeTexture(t.TEXTURE0+r),t.bindTexture(t.TEXTURE_2D,this.iblImportanceSamplingData.cdf),t.uniform1i(this.getUniformLocation(a,"u_sampler_env_map_cdf"),r++),t.activeTexture(t.TEXTURE0+r),t.bindTexture(t.TEXTURE_2D,this.iblImportanceSamplingData.yPdf),t.uniform1i(this.getUniformLocation(a,"u_sampler_env_map_yPdf"),r++),t.activeTexture(t.TEXTURE0+r),t.bindTexture(t.TEXTURE_2D,this.iblImportanceSamplingData.yCdf),t.uniform1i(this.getUniformLocation(a,"u_sampler_env_map_yCdf"),r++);for(let o in(s=this.gpu_scene)==null?void 0:s.texArrayTextures)t.uniform1i(this.getUniformLocation(a,o),r),t.activeTexture(t.TEXTURE0+r++),t.bindTexture(t.TEXTURE_2D_ARRAY,(i=this.gpu_scene)==null?void 0:i.texArrayTextures[o]);return r}getUniformLocation(e,t){let a=this.uniformLocations.get(e);return a||(a=new Map,this.uniformLocations.set(e,a)),a.has(t)||a.set(t,this.gl.getUniformLocation(e,t)),a.get(t)??null}getUniformBlockIndex(e,t){let a=this.uniformBlockIndices.get(e);return a||(a=new Map,this.uniformBlockIndices.set(e,a)),a.has(t)||a.set(t,this.gl.getUniformBlockIndex(e,t)),a.get(t)}render(e,t,a,r,s){this.stopRendering(),this.currentCamera=e,this.currentNumSamples=t,this.tileFinishedCB=a,this.frameFinishedCB=r,this.renderingFinishedCB=s,this.schedulerMode="settling",this.tileIndex=0,this._isRendering=!0,this.resetAccumulation(),this.updateDiagnostics(),this.scheduleFrame()}scheduleFrame(){if(!this._isRendering||this.framePending||this.currentNumSamples!==-1&&this._frameCount>=this.currentNumSamples)return;this.framePending=!0,this.updateDiagnostics();const e=()=>{this.frameHandle=0,this.frameHandleKind=null,this.renderFrame().catch(a=>{console.error(a),this.stopRendering()}).finally(()=>{var a;if(this.framePending=!1,this.updateDiagnostics(),!!this._isRendering){if(this.currentNumSamples!==-1&&this._frameCount>=this.currentNumSamples){this.stopRendering(),(a=this.renderingFinishedCB)==null||a.call(this);return}this.scheduleFrame()}})};if(typeof document<"u"&&document.visibilityState!=="visible"){this.frameHandleKind="timeout",this.frameHandle=window.setTimeout(e,0);return}this.frameHandleKind="raf",this.frameHandle=requestAnimationFrame(e),this.updateDiagnostics()}getActiveTileRes(){return this.schedulerMode==="interactive"?1:this.schedulerMode==="settling"?Math.min(2,Math.max(2,this._tileRes||2)):Math.max(2,this._tileRes||2)}getTileOrder(e){const t=this.tileOrders.get(e);if(t)return t;const a=[],r=new Set;for(let s=e;s>=1;s=Math.floor(s/2)){for(let i=0;i<e;i+=s)for(let o=0;o<e;o+=s){const l=i*e+o;r.has(l)||(r.add(l),a.push(l))}if(s===1)break}return this.tileOrders.set(e,a),a}async renderFrame(){let e=this.gl;const t=this.currentCamera;if(!this._isRendering||!t)return;const a=this.getSelectedRenderProgramKey();if(this.renderProgram=await this.getRenderProgram(a),!this._isRendering)return;const r=this.fbos.get("render"),s=this.fbos.get("render_"),i=this.renderBuffers.get("render"),o=this.renderBuffers.get("render_"),l=this.renderRes,c=this.getActiveTileRes(),h=this.getTileOrder(c);this._resetAccumulation&&(this._frameCount=1,this.tileIndex=0,this._resetAccumulation=!1,e.clearColor(0,0,0,0),e.bindFramebuffer(e.FRAMEBUFFER,s),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,r),e.clear(e.COLOR_BUFFER_BIT));const d=h[this.tileIndex%h.length]??0;let m=6;m=this.bindTextures(m),this.updatePathracingUniforms(t),e.bindVertexArray(this.quadVao),e.viewport(0,0,l[0],l[1]),e.enable(e.SCISSOR_TEST);const b=c,_=c,p=d%c,v=Math.floor(d/c);e.scissor(Math.ceil(p*l[0]/b),Math.ceil((_-v-1)*l[1]/_),Math.ceil(l[0]/b),Math.ceil(l[1]/_)),e.bindFramebuffer(e.FRAMEBUFFER,r),e.activeTexture(e.TEXTURE0+m),e.bindTexture(e.TEXTURE_2D,o),e.uniform1i(this.getUniformLocation(this.renderProgram,"u_sampler2D_PreviousTexture"),m),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(null),e.useProgram(this.copyProgram),e.bindFramebuffer(e.FRAMEBUFFER,s),e.activeTexture(e.TEXTURE0+m),e.bindTexture(e.TEXTURE_2D,i),e.uniform1i(this.getUniformLocation(this.copyProgram,"tex"),m),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.disable(e.SCISSOR_TEST);const u=c*c,S=this.tileIndex+1>=u;if(this.schedulerMode!=="settling"||S){e.bindFramebuffer(e.FRAMEBUFFER,this.fbos.get("postprocess")),e.useProgram(this.tonemapProgram),e.uniform1i(this.getUniformLocation(this.tonemapProgram,"tex"),m),e.uniform1f(this.getUniformLocation(this.tonemapProgram,"exposure"),this._exposure),e.uniform1i(this.getUniformLocation(this.tonemapProgram,"gamma"),this._enableGamma?1:0),e.uniform1i(this.getUniformLocation(this.tonemapProgram,"tonemappingMode"),this.tonemappingModes.indexOf(this._tonemapping)),e.drawArrays(e.TRIANGLE_STRIP,0,4);let x=this.renderBuffers.get("postprocess");this.enableFxaa&&(e.bindFramebuffer(e.FRAMEBUFFER,this.fbos.get("postprocess_")),e.useProgram(this.fxaaProgram),e.bindTexture(e.TEXTURE_2D,this.renderBuffers.get("postprocess")),e.uniform1i(this.getUniformLocation(this.fxaaProgram,"tex"),m),e.uniform2f(this.getUniformLocation(this.fxaaProgram,"u_inv_res"),1/this.renderRes[0],1/this.renderRes[1]),e.drawArrays(e.TRIANGLE_STRIP,0,4),x=this.renderBuffers.get("postprocess_")),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(this.displayProgram),e.viewport(0,0,this.displayRes[0],this.displayRes[1]),e.bindTexture(e.TEXTURE_2D,x),e.uniform1i(this.getUniformLocation(this.displayProgram,"tex"),m),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.bindTexture(e.TEXTURE_2D,null),e.useProgram(null),e.bindVertexArray(null)}this.tileFinishedCB(),this.tileIndex++,this.tileIndex>=u&&(this.tileIndex=0,this._frameCount++,this.frameFinishedCB(this._frameCount),this.schedulerMode==="settling"&&(this.schedulerMode="accumulating"),this.updateDiagnostics())}initFramebuffers(){const e=this.gl;for(const a of this.renderBuffers.values())a&&e.deleteTexture(a);this.renderBuffers.clear();for(const a of this.fbos.values())a&&e.deleteFramebuffer(a);this.fbos.clear();function t(a){let r=[];const s=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,s);for(let i=0;i<a.length;i++)e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+i,e.TEXTURE_2D,a[i],0),r.push(e.COLOR_ATTACHMENT0+i);return e.drawBuffers(r),s}this.renderBuffers.set("render",zn(e,null,this.renderRes[0],this.renderRes[1])),this.renderBuffers.set("render_",zn(e,null,this.renderRes[0],this.renderRes[1])),this.fbos.set("render",t([this.renderBuffers.get("render")])),this.fbos.set("render_",t([this.renderBuffers.get("render_")])),this.renderBuffers.set("postprocess",zn(e,null,this.renderRes[0],this.renderRes[1])),this.renderBuffers.set("postprocess_",zn(e,null,this.renderRes[0],this.renderRes[1])),this.fbos.set("postprocess",t([this.renderBuffers.get("postprocess")])),this.fbos.set("postprocess_",t([this.renderBuffers.get("postprocess_")])),e.bindFramebuffer(e.FRAMEBUFFER,null)}async initFullscreenQuad(){let e=this.gl;const t=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.quadVertexBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.quadVertexBuffer),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,null),this.quadVao=e.createVertexArray(),e.bindVertexArray(this.quadVao),e.enableVertexAttribArray(0),e.bindBuffer(e.ARRAY_BUFFER,this.quadVertexBuffer),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindVertexArray(null)}precompute1DPdfAndCdf(e,t,a,r,s){const i=r*s;let o=0;for(let l=0;l<s;l++)o+=e[i+l];o==0&&(o=1);for(let l=0;l<s;l++)t[i+l]=e[i+l]/o;a[i]=t[i];for(let l=1;l<s;l++)a[i+l]=a[i+l-1]+t[i+l];return a[i+s-1]=1,o}async precomputeIBLImportanceSamplingData(e){const t=performance.now(),a=e.image,r=a.width,s=a.height,i=new Float32Array(r*s),o=new Float32Array(s),l=new Float32Array(r*s),c=new Float32Array(r*s),h=new Float32Array(s),d=new Float32Array(s),m=4;for(let _=0;_<s;_++)for(let p=0;p<r*m;p++){const v=(p+_*r)*m;i[p+_*r]=a.data[v]*.299+a.data[v+1]*.587+a.data[v+2]*.114}for(let _=0;_<s;_++)o[_]=this.precompute1DPdfAndCdf(i,l,c,_,r);const b=this.precompute1DPdfAndCdf(o,h,d,0,s);e.pdf=l,e.cdf=c,e.yPdf=h,e.yCdf=d,e.totalSum=b,console.debug(`Precomputing IBL importance sampling data: ${(performance.now()-t).toFixed(1)}ms`)}setIBL(e){let t=this.gl;this.ibl!==void 0&&(this.gl.deleteTexture(this.ibl),this.gl.deleteTexture(this.iblImportanceSamplingData.pdf),this.gl.deleteTexture(this.iblImportanceSamplingData.cdf),this.gl.deleteTexture(this.iblImportanceSamplingData.yCdf),this.gl.deleteTexture(this.iblImportanceSamplingData.yPdf)),this.ibl=_n(t,t.TEXTURE_2D,t.RGBA32F,e.image.width,e.image.height,t.RGBA,t.FLOAT,e.image.data,0),this.iblImportanceSamplingData.width=e.image.width,this.iblImportanceSamplingData.height=e.image.height,this.precomputeIBLImportanceSamplingData(e),this.iblImportanceSamplingData.pdf=_n(t,t.TEXTURE_2D,t.R32F,e.image.width,e.image.height,t.RED,t.FLOAT,e.pdf,0),this.iblImportanceSamplingData.cdf=_n(t,t.TEXTURE_2D,t.R32F,e.image.width,e.image.height,t.RED,t.FLOAT,e.cdf,0),this.iblImportanceSamplingData.yPdf=_n(t,t.TEXTURE_2D,t.R32F,e.image.height,1,t.RED,t.FLOAT,e.yPdf,0),this.iblImportanceSamplingData.yCdf=_n(t,t.TEXTURE_2D,t.R32F,e.image.height,1,t.RED,t.FLOAT,e.yCdf,0),this.iblImportanceSamplingData.totalSum=e.totalSum,this.resetAccumulation()}async initBvh(e){const t=this.gl;this._bvhDataTexture&&(t.deleteTexture(this._bvhDataTexture),t.deleteTexture(this._bvhIndexTexture));const{nodeData:a,triangleIndices:r,stats:s}=e.bvhPositionBuffer&&e.bvhIndexBuffer?await fh(e.bvhPositionBuffer,e.bvhIndexBuffer):await hh(e.getPositionBuffer(),3);console.log(`BVH: ${s.nodeCount} nodes, ${s.triangleCount} triangles`),this._bvhNodeCount=s.nodeCount,this._bvhIndexCount=r.length,this.diagnostics.bvh={nodes:s.nodeCount,indices:r.length,triangles:s.triangleCount,buildMs:s.buildTimeMs,memoryBytes:a.byteLength+r.byteLength},this._bvhDataTexture=To(t,a);const i=yn(t),o=r.length,l=Math.min(o,i),c=Math.ceil(o/i),h=new Int32Array(l*c);h.set(r),this._bvhIndexTexture=t.createTexture(),t.bindTexture(t.TEXTURE_2D,this._bvhIndexTexture),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,t.R32I,l,c,0,t.RED_INTEGER,t.INT,h)}async setScene(e,t){var l,c;const a={},r=performance.now();this.stopRendering(),this.scene=e,this.diagnostics.scene={triangles:e.num_triangles,vertices:(((l=e.vertexBuffer)==null?void 0:l.length)??0)/20,indices:((c=e.triangleIndexBuffer)==null?void 0:c.length)??0,materials:e.num_materials,textures:e.num_textures,lights:e.lights.length},this.renderProgram=null,this.renderPrograms.clear(),this.renderProgramPromises.clear(),this.renderShaderMaps.clear(),t==null||t({phase:"Uploading scene",detail:"Creating WebGL textures and buffers."});const s=performance.now();this.gpu_scene=new Th(this.gl,e),await this.gpu_scene.init(),a.gpuUploadMs=performance.now()-s,this.updateMemoryDiagnostics(),t==null||t({phase:"Building BVH",detail:"Creating acceleration structure for ray traversal."});const i=performance.now();await this.initBvh(e),a.bvhBuildMs=performance.now()-i,t==null||t({phase:"Compiling shaders",detail:"Preparing MIS path tracing shader programs."});const o=performance.now();await this.initializeShaders(),a.shaderInitMs=performance.now()-o,a.rendererSetupMs=performance.now()-r,this.diagnostics.profiling={...this.diagnostics.profiling,...a},this.updateDiagnostics(),t==null||t({phase:"Ready",detail:"Scene uploaded and renderer initialized.",meta:`GPU ${a.gpuUploadMs.toFixed(0)}ms | BVH ${a.bvhBuildMs.toFixed(0)}ms | shaders ${a.shaderInitMs.toFixed(0)}ms`}),console.table(a),this.resetAccumulation()}updateMemoryDiagnostics(){var a,r;const e=(a=this.gpu_scene)==null?void 0:a.memoryUsage,t=((r=this.diagnostics.bvh)==null?void 0:r.memoryBytes)??0;e&&(this.diagnostics.memory={textureBytes:e.textureBytes,geometryBytes:e.geometryBytes,bvhBytes:t,totalBytes:e.totalBytes+t})}updateDiagnostics(){this.diagnostics.sampleCount=Math.max(0,this._frameCount-1),this.diagnostics.mode=this.schedulerMode,this.diagnostics.renderResolution=`${this.renderRes[0]}x${this.renderRes[1]}`,this.diagnostics.displayResolution=`${this.displayRes[0]}x${this.displayRes[1]}`,this.diagnostics.tileResolution=this.getActiveTileRes(),this.diagnostics.framePending=this.framePending,this.diagnostics.shaderPrograms=Array.from(this.renderPrograms.keys()),this.updateMemoryDiagnostics()}bindGPUBuffersAndTextures(e){const t=this.gl;t.useProgram(e);let a=0;t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,this._bvhDataTexture),t.uniform1i(this.getUniformLocation(e,"u_sampler_bvh"),a++),t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,this._bvhIndexTexture),t.uniform1i(this.getUniformLocation(e,"u_sampler_bvh_index"),a++),t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,this.gpu_scene.triangleDataTexture),t.uniform1i(this.getUniformLocation(e,"u_sampler_triangle_data"),a++),t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,this.gpu_scene.triangleIndexTexture),t.uniform1i(this.getUniformLocation(e,"u_sampler_triangle_indices"),a++),t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,this.gpu_scene.materialDataTexture),t.uniform1i(this.getUniformLocation(e,"u_sampler_material_data"),a++),t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,this.gpu_scene.textureInfoDataTexture),t.uniform1i(this.getUniformLocation(e,"u_sampler_texture_info"),a++);let r=this.getUniformBlockIndex(e,"PathTracingUniformBlock");t.uniformBlockBinding(e,r,0),t.useProgram(null)}getSelectedRenderProgramKey(){return this.debugMode!="None"?"debug_program":"misptdl_program"}async getRenderProgram(e){const t=this.renderPrograms.get(e);if(t)return t;let a=this.renderProgramPromises.get(e);if(!a){const r=this.renderShaderMaps.get(e);if(!r)throw new Error(`Render shader map not initialized for ${e}`);a=un(this.gl,dn,Bh,r,e).then(s=>(this.renderPrograms.set(e,s),this.bindGPUBuffersAndTextures(s),s)).catch(s=>{throw this.renderProgramPromises.delete(e),s}),this.renderProgramPromises.set(e,a)}return a}async initializeShaders(){if(!this.gpu_scene)throw new Error("Scene not initialized");const e=`
    const uint MAX_TEXTURE_SIZE = ${yn(this.gl)}u;
    ivec2 getStructParameterTexCoord(uint structIdx, uint paramIdx, uint structStride) {
    return ivec2((structIdx * structStride + paramIdx) % MAX_TEXTURE_SIZE,
                (structIdx * structStride + paramIdx) / MAX_TEXTURE_SIZE);
    }
    `,t=`
    const uint VERTEX_STRIDE = 5u;
    const uint TRIANGLE_INDEX_STRIDE = 3u;
    const uint POSITION_OFFSET = 0u;
    const uint NORMAL_OFFSET = 1u;
    const uint UV_OFFSET = 2u;
    const uint TANGENT_OFFSET = 3u;
    const uint COLOR_OFFSET = 4u;
    #define NUM_TRIANGLES uint(u_scene_counts.x)
    #define NUM_BVH_NODES int(u_scene_counts.y)
    #define NUM_BVH_INDICES int(u_scene_counts.z)
    `,a=this.materialProfile==="webgl-full"?Fh:Ph,r=new Map([["structs",Rh],["rng",Ah],["constants",wh],["lights",this.gpu_scene.lightShaderChunk],["utils",Dh],["material",Mh],["buffer_accessor",e],["texture_accessor",this.gpu_scene.texAccessorShaderChunk],["material_block",this.gpu_scene.materialBufferShaderChunk],["pbr_kernel",a],["pbr_material_adapter",kh],["bvh",Nh],["lighting",jh],["mesh_constants",t]]),s=new Map(r);s.set("integrator",Oh);const i=new Map(r);i.set("integrator",Vh),this.renderShaderMaps.set("debug_program",s),this.renderShaderMaps.set("misptdl_program",i),[this.copyProgram,this.displayProgram,this.tonemapProgram,this.fxaaProgram]=await Promise.all([un(this.gl,dn,yh,void 0,"copy"),un(this.gl,dn,Eh,void 0,"display"),un(this.gl,dn,Ch,void 0,"tonemap"),un(this.gl,dn,Ih,void 0,"fxaa")]),this.renderProgram=await this.getRenderProgram("misptdl_program")}}function wo(n){let e;try{e=new URL(n)}catch{return n}if(e.protocol!=="http:"&&e.protocol!=="https:")return n;const t=Uh(e);return t||n}function Uh(n){const e=n.hostname.toLowerCase(),t=n.pathname.split("/").filter(Boolean);if(t.length<5)return null;if(e==="github.com"){const[a,r,s,...i]=t;if(!a||!r)return null;if(s==="raw"&&i[0]==="refs"&&i[1]==="heads"&&i[2]){const o=i[2],l=i.slice(3).join("/");return Ra(a,r,o,l)}if(s==="blob"&&i[0]==="refs"&&i[1]==="heads"&&i[2]){const o=i[2],l=i.slice(3).join("/");return Ra(a,r,o,l)}if((s==="raw"||s==="blob")&&i[0]){const o=i[0],l=i.slice(1).join("/");return Ra(a,r,o,l)}}return null}function Ra(n,e,t,a){return a?`https://raw.githubusercontent.com/${n}/${e}/${t}/${a}`:null}const Gh="dspbr-pt-assets-v1",Aa=new Map;function Wh(){return typeof globalThis.caches<"u"&&typeof globalThis.Request<"u"}function zh(n){try{const e=typeof globalThis.location<"u"?globalThis.location.href:void 0,t=new URL(n,e);return t.protocol!=="http:"&&t.protocol!=="https:"?null:t.href}catch{return null}}function Hh(n){return!(n!=null&&n.method)||n.method.toUpperCase()==="GET"}async function yo(n,e){const t=zh(n);if(!t||!Hh(e)||!Wh())return fetch(n,e);let a,r;try{a=await caches.open(Gh),r=new Request(t);const o=await a.match(r);if(o)return o}catch(o){return console.warn("Asset cache unavailable; falling back to network fetch.",o),fetch(n,e)}const s=Aa.get(t);if(s)return(await s).clone();const i=fetch(n,e).then(async o=>{try{o.ok&&await a.put(r,o.clone())}catch(l){console.warn("Asset cache write failed; using network response.",l)}return o}).finally(()=>{Aa.delete(t)});return Aa.set(t,i),(await i).clone()}function Ve(n){throw new Error(`HDR parse error: ${n}`)}function Gs(n){let e="";for(;(n.pos??0)<n.length;){const t=n[n.pos??0];if(n.pos=(n.pos??0)+1,e+=String.fromCharCode(t),t===10)break}return e}function Xh(n){const e=Gs(n);if(!e.startsWith("#?"))return Ve("bad initial token");let t=e,a=1,r=1,s="",i=0,o=0;for(;;){const l=Gs(n);if(!l)return Ve("no header found");if(t+=l,l.startsWith("GAMMA=")){a=Number.parseFloat(l.slice(6));continue}if(l.startsWith("EXPOSURE=")){r=Number.parseFloat(l.slice(9));continue}if(l.startsWith("FORMAT=")){s=l.slice(7).trim();continue}const c=l.match(/^\s*-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/);if(c){o=Number.parseInt(c[1],10),i=Number.parseInt(c[2],10);break}}return s!=="32-bit_rle_rgbe"?Ve(`unsupported format "${s}"`):i<=0||o<=0?Ve("invalid image dimensions"):{header:t,gamma:a,exposure:r,width:i,height:o}}function Kh(n,e,t){if(e<8||e>32767)return Ve("unsupported scanline width for RLE");const a=new Uint8Array(e*t*4),r=new Uint8Array(e*4);for(let s=0;s<t;s+=1){if((n.pos??0)+4>n.length)return Ve("unexpected end of file");const i=n[n.pos??0],o=n[(n.pos??0)+1],l=n[(n.pos??0)+2],c=n[(n.pos??0)+3];if(n.pos=(n.pos??0)+4,i!==2||o!==2||(l<<8|c)!==e)return Ve("bad rgbe scanline format");for(let d=0;d<4;d+=1){let m=0;for(;m<e;){if((n.pos??0)>=n.length)return Ve("unexpected end of file in scanline");const b=n[n.pos??0];if(n.pos=(n.pos??0)+1,b>128){const _=b-128;if(_<=0||m+_>e||(n.pos??0)>=n.length)return Ve("bad scanline data");const p=n[n.pos??0];n.pos=(n.pos??0)+1,r.fill(p,d*e+m,d*e+m+_),m+=_}else{const _=b;if(_<=0||m+_>e||(n.pos??0)+_>n.length)return Ve("bad scanline data");r.set(n.subarray(n.pos??0,(n.pos??0)+_),d*e+m),n.pos=(n.pos??0)+_,m+=_}}}const h=s*e*4;for(let d=0;d<e;d+=1)a[h+d*4+0]=r[d],a[h+d*4+1]=r[d+e],a[h+d*4+2]=r[d+2*e],a[h+d*4+3]=r[d+3*e]}return a}function qh(n,e,t,a){const r=n[e+3];if(r>0){const s=Math.pow(2,r-128)/255;t[a+0]=n[e+0]*s,t[a+1]=n[e+1]*s,t[a+2]=n[e+2]*s}else t[a+0]=0,t[a+1]=0,t[a+2]=0;t[a+3]=1}function Eo(n){const t=n instanceof Uint8Array?n:new Uint8Array(n);t.pos=0;const a=Xh(t),r=Kh(t,a.width,a.height),s=new Float32Array(a.width*a.height*4);for(let i=0;i<a.width*a.height;i+=1)qh(r,i*4,s,i*4);return{image:{data:s,width:a.width,height:a.height},header:a.header,gamma:a.gamma,exposure:a.exposure}}async function _0(n){return Eo(await n.arrayBuffer())}async function d0(n){const e=await yo(wo(n));if(!e.ok)throw new Error(`Failed to load HDR: ${e.status} ${e.statusText}`);return Eo(await e.arrayBuffer())}var Co=class{constructor(){y(this,"_listeners",{})}addEventListener(n,e){const t=this._listeners;return t[n]===void 0&&(t[n]=[]),t[n].indexOf(e)===-1&&t[n].push(e),this}removeEventListener(n,e){const t=this._listeners[n];if(t!==void 0){const a=t.indexOf(e);a!==-1&&t.splice(a,1)}return this}dispatchEvent(n){const e=this._listeners[n.type];if(e!==void 0){const t=e.slice(0);for(let a=0,r=t.length;a<r;a++)t[a].call(this,n)}return this}dispose(){for(const n in this._listeners)delete this._listeners[n]}},Wt=class{constructor(n,e,t,a={}){y(this,"_disposed",!1);y(this,"_name");y(this,"_parent");y(this,"_child");y(this,"_attributes");if(this._name=n,this._parent=e,this._child=t,this._attributes=a,!e.isOnGraph(t))throw new Error("Cannot connect disconnected graphs.")}getName(){return this._name}getParent(){return this._parent}getChild(){return this._child}setChild(n){return this._child=n,this}getAttributes(){return this._attributes}dispose(){this._disposed||(this._parent._destroyRef(this),this._disposed=!0)}isDisposed(){return this._disposed}},Jh=class extends Co{constructor(){super(...arguments);y(this,"_emptySet",new Set);y(this,"_edges",new Set);y(this,"_parentEdges",new Map);y(this,"_childEdges",new Map)}listEdges(){return Array.from(this._edges)}listParentEdges(e){return Array.from(this._childEdges.get(e)||this._emptySet)}listParents(e){const t=new Set;for(const a of this.listParentEdges(e))t.add(a.getParent());return Array.from(t)}listChildEdges(e){return Array.from(this._parentEdges.get(e)||this._emptySet)}listChildren(e){const t=new Set;for(const a of this.listChildEdges(e))t.add(a.getChild());return Array.from(t)}disconnectParents(e,t){for(const a of this.listParentEdges(e))(!t||t(a.getParent()))&&a.dispose();return this}_createEdge(e,t,a,r){const s=new Wt(e,t,a,r);this._edges.add(s);const i=s.getParent();this._parentEdges.has(i)||this._parentEdges.set(i,new Set),this._parentEdges.get(i).add(s);const o=s.getChild();return this._childEdges.has(o)||this._childEdges.set(o,new Set),this._childEdges.get(o).add(s),s}_destroyEdge(e){return this._edges.delete(e),this._parentEdges.get(e.getParent()).delete(e),this._childEdges.get(e.getChild()).delete(e),this}},vt=class{constructor(n){y(this,"list",[]);if(n)for(const e of n)this.list.push(e)}add(n){this.list.push(n)}remove(n){const e=this.list.indexOf(n);e>=0&&this.list.splice(e,1)}removeChild(n){const e=[];for(const t of this.list)t.getChild()===n&&e.push(t);for(const t of e)this.remove(t);return e}listRefsByChild(n){const e=[];for(const t of this.list)t.getChild()===n&&e.push(t);return e}values(){return this.list}},K=class{constructor(n){y(this,"set",new Set);y(this,"map",new Map);if(n)for(const e of n)this.add(e)}add(n){const e=n.getChild();this.removeChild(e),this.set.add(n),this.map.set(e,n)}remove(n){this.set.delete(n),this.map.delete(n.getChild())}removeChild(n){const e=this.map.get(n)||null;return e&&this.remove(e),e}getRefByChild(n){return this.map.get(n)||null}values(){return Array.from(this.set)}},ke=class{constructor(n){y(this,"map",{});n&&Object.assign(this.map,n)}set(n,e){this.map[n]=e}delete(n){delete this.map[n]}get(n){return this.map[n]||null}keys(){return Object.keys(this.map)}values(){return Object.values(this.map)}};const W=Symbol("attributes"),Ct=Symbol("immutableKeys");var bi,mi,gi,Yh=class Io extends(gi=Co,mi=W,bi=Ct,gi){constructor(t){super();y(this,"_disposed",!1);y(this,"graph");y(this,mi);y(this,bi);this.graph=t,this[Ct]=new Set,this[W]=this._createAttributes()}getDefaults(){return{}}_createAttributes(){const t=this.getDefaults(),a={};for(const r in t){const s=t[r];if(s instanceof Io){const i=this.graph._createEdge(r,this,s);this[Ct].add(r),a[r]=i}else a[r]=s}return a}isOnGraph(t){return this.graph===t.graph}isDisposed(){return this._disposed}dispose(){this._disposed||(this.graph.listChildEdges(this).forEach(t=>t.dispose()),this.graph.disconnectParents(this),this._disposed=!0,this.dispatchEvent({type:"dispose"}))}detach(){return this.graph.disconnectParents(this),this}swap(t,a){for(const r in this[W]){const s=this[W][r];if(s instanceof Wt){const i=s;i.getChild()===t&&this.setRef(r,a,i.getAttributes())}else if(s instanceof vt)for(const i of s.listRefsByChild(t)){const o=i.getAttributes();this.removeRef(r,t),this.addRef(r,a,o)}else if(s instanceof K){const i=s.getRefByChild(t);if(i){const o=i.getAttributes();this.removeRef(r,t),this.addRef(r,a,o)}}else if(s instanceof ke)for(const i of s.keys()){const o=s.get(i);o.getChild()===t&&this.setRefMap(r,i,a,o.getAttributes())}}return this}get(t){return this[W][t]}set(t,a){return this[W][t]=a,this.dispatchEvent({type:"change",attribute:t})}getRef(t){const a=this[W][t];return a?a.getChild():null}setRef(t,a,r){if(this[Ct].has(t))throw new Error(`Cannot overwrite immutable attribute, "${t}".`);const s=this[W][t];if(s&&s.dispose(),!a)return this;const i=this.graph._createEdge(t,this,a,r);return this[W][t]=i,this.dispatchEvent({type:"change",attribute:t})}listRefs(t){return this.assertRefList(t).values().map(a=>a.getChild())}addRef(t,a,r){const s=this.graph._createEdge(t,this,a,r);return this.assertRefList(t).add(s),this.dispatchEvent({type:"change",attribute:t})}removeRef(t,a){const r=this.assertRefList(t);if(r instanceof vt)for(const s of r.listRefsByChild(a))s.dispose();else{const s=r.getRefByChild(a);s&&s.dispose()}return this}assertRefList(t){const a=this[W][t];if(a instanceof vt||a instanceof K)return a;throw new Error(`Expected RefList or RefSet for attribute "${t}"`)}listRefMapKeys(t){return this.assertRefMap(t).keys()}listRefMapValues(t){return this.assertRefMap(t).values().map(a=>a.getChild())}getRefMap(t,a){const r=this.assertRefMap(t).get(a);return r?r.getChild():null}setRefMap(t,a,r,s){const i=this.assertRefMap(t),o=i.get(a);if(o&&o.dispose(),!r)return this;s=Object.assign(s||{},{key:a});const l=this.graph._createEdge(t,this,r,{...s,key:a});return i.set(a,l),this.dispatchEvent({type:"change",attribute:t,key:a})}assertRefMap(t){const a=this[W][t];if(a instanceof ke)return a;throw new Error(`Expected RefMap for attribute "${t}"`)}dispatchEvent(t){return super.dispatchEvent({...t,target:this}),this.graph.dispatchEvent({...t,target:this,type:`node:${t.type}`}),this}_destroyRef(t){const a=t.getName();if(this[W][a]===t)this[W][a]=null,this[Ct].has(a)&&t.getChild().dispose();else if(this[W][a]instanceof vt)this[W][a].remove(t);else if(this[W][a]instanceof K)this[W][a].remove(t);else if(this[W][a]instanceof ke){const r=this[W][a];for(const s of r.keys())r.get(s)===t&&r.delete(s)}else return;this.graph._destroyEdge(t),this.dispatchEvent({type:"change",attribute:a})}};const Ro="v4.3.0",qt="@glb.bin";var E;(function(n){n.ACCESSOR="Accessor",n.ANIMATION="Animation",n.ANIMATION_CHANNEL="AnimationChannel",n.ANIMATION_SAMPLER="AnimationSampler",n.BUFFER="Buffer",n.CAMERA="Camera",n.MATERIAL="Material",n.MESH="Mesh",n.PRIMITIVE="Primitive",n.PRIMITIVE_TARGET="PrimitiveTarget",n.NODE="Node",n.ROOT="Root",n.SCENE="Scene",n.SKIN="Skin",n.TEXTURE="Texture",n.TEXTURE_INFO="TextureInfo"})(E||(E={}));var Jt;(function(n){n.INTERLEAVED="interleaved",n.SEPARATE="separate"})(Jt||(Jt={}));var Te;(function(n){n.ARRAY_BUFFER="ARRAY_BUFFER",n.ELEMENT_ARRAY_BUFFER="ELEMENT_ARRAY_BUFFER",n.INVERSE_BIND_MATRICES="INVERSE_BIND_MATRICES",n.OTHER="OTHER",n.SPARSE="SPARSE"})(Te||(Te={}));var Pe;(function(n){n[n.R=4096]="R",n[n.G=256]="G",n[n.B=16]="B",n[n.A=1]="A"})(Pe||(Pe={}));var St;(function(n){n.GLTF="GLTF",n.GLB="GLB"})(St||(St={}));const ba={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};class B{static createBufferFromDataURI(e){if(typeof Buffer>"u"){const t=atob(e.split(",")[1]),a=new Uint8Array(t.length);for(let r=0;r<t.length;r++)a[r]=t.charCodeAt(r);return a}else{const t=e.split(",")[1],a=e.indexOf("base64")>=0;return Buffer.from(t,a?"base64":"utf8")}}static encodeText(e){return new TextEncoder().encode(e)}static decodeText(e){return new TextDecoder().decode(e)}static concat(e){let t=0;for(const s of e)t+=s.byteLength;const a=new Uint8Array(t);let r=0;for(const s of e)a.set(s,r),r+=s.byteLength;return a}static pad(e,t=0){const a=this.padNumber(e.byteLength);if(a===e.byteLength)return e;const r=new Uint8Array(a);if(r.set(e),t!==0)for(let s=e.byteLength;s<a;s++)r[s]=t;return r}static padNumber(e){return Math.ceil(e/4)*4}static equals(e,t){if(e===t)return!0;if(e.byteLength!==t.byteLength)return!1;let a=e.byteLength;for(;a--;)if(e[a]!==t[a])return!1;return!0}static toView(e,t=0,a=1/0){return new Uint8Array(e.buffer,e.byteOffset+t,Math.min(e.byteLength,a))}static assertView(e){if(e&&!ArrayBuffer.isView(e))throw new Error(`Method requires Uint8Array parameter; received "${typeof e}".`);return e}}class $h{match(e){return e.length>=3&&e[0]===255&&e[1]===216&&e[2]===255}getSize(e){let t=new DataView(e.buffer,e.byteOffset+4),a,r;for(;t.byteLength;){if(a=t.getUint16(0,!1),Qh(t,a),r=t.getUint8(a+1),r===192||r===193||r===194)return[t.getUint16(a+7,!1),t.getUint16(a+5,!1)];t=new DataView(e.buffer,t.byteOffset+a+2)}throw new TypeError("Invalid JPG, no size found")}getChannels(e){return 3}}class ma{match(e){return e.length>=8&&e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71&&e[4]===13&&e[5]===10&&e[6]===26&&e[7]===10}getSize(e){const t=new DataView(e.buffer,e.byteOffset);return B.decodeText(e.slice(12,16))===ma.PNG_FRIED_CHUNK_NAME?[t.getUint32(32,!1),t.getUint32(36,!1)]:[t.getUint32(16,!1),t.getUint32(20,!1)]}getChannels(e){return 4}}ma.PNG_FRIED_CHUNK_NAME="CgBI";class Ue{static registerFormat(e,t){this.impls[e]=t}static getMimeType(e){for(const t in this.impls)if(this.impls[t].match(e))return t;return null}static getSize(e,t){return this.impls[t]?this.impls[t].getSize(e):null}static getChannels(e,t){return this.impls[t]?this.impls[t].getChannels(e):null}static getVRAMByteLength(e,t){if(!this.impls[t])return null;if(this.impls[t].getVRAMByteLength)return this.impls[t].getVRAMByteLength(e);let a=0;const r=4,s=this.getSize(e,t);if(!s)return null;for(;s[0]>1||s[1]>1;)a+=s[0]*s[1]*r,s[0]=Math.max(Math.floor(s[0]/2),1),s[1]=Math.max(Math.floor(s[1]/2),1);return a+=1*r,a}static mimeTypeToExtension(e){return e==="image/jpeg"?"jpg":e.split("/").pop()}static extensionToMimeType(e){return e==="jpg"?"image/jpeg":e?`image/${e}`:""}}Ue.impls={"image/jpeg":new $h,"image/png":new ma};function Qh(n,e){if(e>n.byteLength)throw new TypeError("Corrupt JPG, exceeded buffer limits");if(n.getUint8(e)!==255)throw new TypeError("Invalid JPG, marker table corrupted");return n}class Yt{static basename(e){const t=e.split(/[\\/]/).pop();return t.substring(0,t.lastIndexOf("."))}static extension(e){if(e.startsWith("data:image/")){const t=e.match(/data:(image\/\w+)/)[1];return Ue.mimeTypeToExtension(t)}else{if(e.startsWith("data:model/gltf+json"))return"gltf";if(e.startsWith("data:model/gltf-binary"))return"glb";if(e.startsWith("data:application/"))return"bin"}return e.split(/[\\/]/).pop().split(/[.]/).pop()}}var Ua=typeof Float32Array<"u"?Float32Array:Array;function Zh(){var n=new Ua(3);return Ua!=Float32Array&&(n[0]=0,n[1]=0,n[2]=0),n}function Da(n){var e=n[0],t=n[1],a=n[2];return Math.sqrt(e*e+t*t+a*a)}function ef(n,e,t){var a=e[0],r=e[1],s=e[2],i=t[3]*a+t[7]*r+t[11]*s+t[15];return i=i||1,n[0]=(t[0]*a+t[4]*r+t[8]*s+t[12])/i,n[1]=(t[1]*a+t[5]*r+t[9]*s+t[13])/i,n[2]=(t[2]*a+t[6]*r+t[10]*s+t[14])/i,n}(function(){var n=Zh();return function(e,t,a,r,s,i){var o,l;for(t||(t=3),a||(a=0),r?l=Math.min(r*t+a,e.length):l=e.length,o=a;o<l;o+=t)n[0]=e[o],n[1]=e[o+1],n[2]=e[o+2],s(n,n,i),e[o]=n[0],e[o+1]=n[1],e[o+2]=n[2];return e}})();function tf(n){const e=Ao(),t=n.propertyType===E.NODE?[n]:n.listChildren();for(const a of t)a.traverse(r=>{const s=r.getMesh();if(!s)return;const i=nf(s,r.getWorldMatrix());i.min.every(isFinite)&&i.max.every(isFinite)&&(Ga(i.min,e),Ga(i.max,e))});return e}function nf(n,e){const t=Ao();for(const a of n.listPrimitives()){const r=a.getAttribute("POSITION"),s=a.getIndices();if(!r)continue;let i=[0,0,0],o=[0,0,0];for(let l=0,c=s?s.getCount():r.getCount();l<c;l++){const h=s?s.getScalar(l):l;i=r.getElement(h,i),o=ef(o,i,e),Ga(o,t)}}return t}function Ga(n,e){for(let t=0;t<3;t++)e.min[t]=Math.min(n[t],e.min[t]),e.max[t]=Math.max(n[t],e.max[t])}function Ao(){return{min:[1/0,1/0,1/0],max:[-1/0,-1/0,-1/0]}}const Ws="https://null.example";class mn{static dirname(e){const t=e.lastIndexOf("/");return t===-1?"./":e.substring(0,t+1)}static basename(e){return Yt.basename(new URL(e,Ws).pathname)}static extension(e){return Yt.extension(new URL(e,Ws).pathname)}static resolve(e,t){if(!this.isRelativePath(t))return t;const a=e.split("/"),r=t.split("/");a.pop();for(let s=0;s<r.length;s++)r[s]!=="."&&(r[s]===".."?a.pop():a.push(r[s]));return a.join("/")}static isAbsoluteURL(e){return this.PROTOCOL_REGEXP.test(e)}static isRelativePath(e){return!/^(?:[a-zA-Z]+:)?\//.test(e)}}mn.DEFAULT_INIT={};mn.PROTOCOL_REGEXP=/^[a-zA-Z]+:\/\//;function zs(n){return Object.prototype.toString.call(n)==="[object Object]"}function It(n){if(zs(n)===!1)return!1;const e=n.constructor;if(e===void 0)return!0;const t=e.prototype;return!(zs(t)===!1||Object.hasOwn(t,"isPrototypeOf")===!1)}var Wa,za;(function(n){n[n.SILENT=4]="SILENT",n[n.ERROR=3]="ERROR",n[n.WARN=2]="WARN",n[n.INFO=1]="INFO",n[n.DEBUG=0]="DEBUG"})(za||(za={}));class Me{constructor(e){this.verbosity=void 0,this.verbosity=e}debug(e){this.verbosity<=Me.Verbosity.DEBUG&&console.debug(e)}info(e){this.verbosity<=Me.Verbosity.INFO&&console.info(e)}warn(e){this.verbosity<=Me.Verbosity.WARN&&console.warn(e)}error(e){this.verbosity<=Me.Verbosity.ERROR&&console.error(e)}}Wa=Me;Me.Verbosity=za;Me.DEFAULT_INSTANCE=new Wa(Wa.Verbosity.INFO);function af(n){var e=n[0],t=n[1],a=n[2],r=n[3],s=n[4],i=n[5],o=n[6],l=n[7],c=n[8],h=n[9],d=n[10],m=n[11],b=n[12],_=n[13],p=n[14],v=n[15],u=e*i-t*s,S=e*o-a*s,g=t*o-a*i,x=c*_-h*b,T=c*p-d*b,C=h*p-d*_,f=e*C-t*T+a*x,w=s*C-i*T+o*x,R=c*g-h*S+d*u,I=b*g-_*S+p*u;return l*f-r*w+v*R-m*I}function rf(n,e,t){var a=e[0],r=e[1],s=e[2],i=e[3],o=e[4],l=e[5],c=e[6],h=e[7],d=e[8],m=e[9],b=e[10],_=e[11],p=e[12],v=e[13],u=e[14],S=e[15],g=t[0],x=t[1],T=t[2],C=t[3];return n[0]=g*a+x*o+T*d+C*p,n[1]=g*r+x*l+T*m+C*v,n[2]=g*s+x*c+T*b+C*u,n[3]=g*i+x*h+T*_+C*S,g=t[4],x=t[5],T=t[6],C=t[7],n[4]=g*a+x*o+T*d+C*p,n[5]=g*r+x*l+T*m+C*v,n[6]=g*s+x*c+T*b+C*u,n[7]=g*i+x*h+T*_+C*S,g=t[8],x=t[9],T=t[10],C=t[11],n[8]=g*a+x*o+T*d+C*p,n[9]=g*r+x*l+T*m+C*v,n[10]=g*s+x*c+T*b+C*u,n[11]=g*i+x*h+T*_+C*S,g=t[12],x=t[13],T=t[14],C=t[15],n[12]=g*a+x*o+T*d+C*p,n[13]=g*r+x*l+T*m+C*v,n[14]=g*s+x*c+T*b+C*u,n[15]=g*i+x*h+T*_+C*S,n}function sf(n,e){var t=e[0],a=e[1],r=e[2],s=e[4],i=e[5],o=e[6],l=e[8],c=e[9],h=e[10];return n[0]=Math.sqrt(t*t+a*a+r*r),n[1]=Math.sqrt(s*s+i*i+o*o),n[2]=Math.sqrt(l*l+c*c+h*h),n}function of(n,e){var t=new Ua(3);sf(t,e);var a=1/t[0],r=1/t[1],s=1/t[2],i=e[0]*a,o=e[1]*r,l=e[2]*s,c=e[4]*a,h=e[5]*r,d=e[6]*s,m=e[8]*a,b=e[9]*r,_=e[10]*s,p=i+h+_,v=0;return p>0?(v=Math.sqrt(p+1)*2,n[3]=.25*v,n[0]=(d-b)/v,n[1]=(m-l)/v,n[2]=(o-c)/v):i>h&&i>_?(v=Math.sqrt(1+i-h-_)*2,n[3]=(d-b)/v,n[0]=.25*v,n[1]=(o+c)/v,n[2]=(m+l)/v):h>_?(v=Math.sqrt(1+h-i-_)*2,n[3]=(m-l)/v,n[0]=(o+c)/v,n[1]=.25*v,n[2]=(d+b)/v):(v=Math.sqrt(1+_-i-h)*2,n[3]=(o-c)/v,n[0]=(m+l)/v,n[1]=(d+b)/v,n[2]=.25*v),n}class H{static identity(e){return e}static eq(e,t,a=1e-5){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(Math.abs(e[r]-t[r])>a)return!1;return!0}static clamp(e,t,a){return e<t?t:e>a?a:e}static decodeNormalizedInt(e,t){switch(t){case 5126:return e;case 5123:return e/65535;case 5121:return e/255;case 5122:return Math.max(e/32767,-1);case 5120:return Math.max(e/127,-1);default:throw new Error("Invalid component type.")}}static encodeNormalizedInt(e,t){switch(t){case 5126:return e;case 5123:return Math.round(H.clamp(e,0,1)*65535);case 5121:return Math.round(H.clamp(e,0,1)*255);case 5122:return Math.round(H.clamp(e,-1,1)*32767);case 5120:return Math.round(H.clamp(e,-1,1)*127);default:throw new Error("Invalid component type.")}}static decompose(e,t,a,r){let s=Da([e[0],e[1],e[2]]);const i=Da([e[4],e[5],e[6]]),o=Da([e[8],e[9],e[10]]);af(e)<0&&(s=-s),t[0]=e[12],t[1]=e[13],t[2]=e[14];const c=e.slice(),h=1/s,d=1/i,m=1/o;c[0]*=h,c[1]*=h,c[2]*=h,c[4]*=d,c[5]*=d,c[6]*=d,c[8]*=m,c[9]*=m,c[10]*=m,of(a,c),r[0]=s,r[1]=i,r[2]=o}static compose(e,t,a,r){const s=r,i=t[0],o=t[1],l=t[2],c=t[3],h=i+i,d=o+o,m=l+l,b=i*h,_=i*d,p=i*m,v=o*d,u=o*m,S=l*m,g=c*h,x=c*d,T=c*m,C=a[0],f=a[1],w=a[2];return s[0]=(1-(v+S))*C,s[1]=(_+T)*C,s[2]=(p-x)*C,s[3]=0,s[4]=(_-T)*f,s[5]=(1-(b+S))*f,s[6]=(u+g)*f,s[7]=0,s[8]=(p+x)*w,s[9]=(u-g)*w,s[10]=(1-(b+v))*w,s[11]=0,s[12]=e[0],s[13]=e[1],s[14]=e[2],s[15]=1,s}}function lf(n,e){if(!!n!=!!e)return!1;const t=n.getChild(),a=e.getChild();return t===a||t.equals(a)}function cf(n,e){if(!!n!=!!e)return!1;const t=n.values(),a=e.values();if(t.length!==a.length)return!1;for(let r=0;r<t.length;r++){const s=t[r],i=a[r];if(s.getChild()!==i.getChild()&&!s.getChild().equals(i.getChild()))return!1}return!0}function uf(n,e){if(!!n!=!!e)return!1;const t=n.keys(),a=e.keys();if(t.length!==a.length)return!1;for(const r of t){const s=n.get(r),i=e.get(r);if(!!s!=!!i)return!1;const o=s.getChild(),l=i.getChild();if(o!==l&&!o.equals(l))return!1}return!0}function Do(n,e){if(n===e)return!0;if(!!n!=!!e||!n||!e||n.length!==e.length)return!1;for(let t=0;t<n.length;t++)if(n[t]!==e[t])return!1;return!0}function Mo(n,e){if(n===e)return!0;if(!!n!=!!e)return!1;if(!It(n)||!It(e))return n===e;const t=n,a=e;let r=0,s=0,i;for(i in t)r++;for(i in a)s++;if(r!==s)return!1;for(i in t){const o=t[i],l=a[i];if(sa(o)&&sa(l)){if(!Do(o,l))return!1}else if(It(o)&&It(l)){if(!Mo(o,l))return!1}else if(o!==l)return!1}return!0}function sa(n){return Array.isArray(n)||ArrayBuffer.isView(n)}const Hs="23456789abdegjkmnpqrvwxyzABDEGJKMNPQRVWXYZ",_f=999,df=6,Xs=new Set,hf=function(){let e="";for(let t=0;t<df;t++)e+=Hs.charAt(Math.floor(Math.random()*Hs.length));return e},ff=function(){for(let e=0;e<_f;e++){const t=hf();if(!Xs.has(t))return Xs.add(t),t}return""},wt=n=>n,pf=new Set;class Tr extends Yh{constructor(e,t=""){super(e),this[W].name=t,this.init(),this.dispatchEvent({type:"create"})}getGraph(){return this.graph}getDefaults(){return Object.assign(super.getDefaults(),{name:"",extras:{}})}set(e,t){return Array.isArray(t)&&(t=t.slice()),super.set(e,t)}getName(){return this.get("name")}setName(e){return this.set("name",e)}getExtras(){return this.get("extras")}setExtras(e){return this.set("extras",e)}clone(){const e=this.constructor;return new e(this.graph).copy(this,wt)}copy(e,t=wt){for(const a in this[W]){const r=this[W][a];if(r instanceof Wt)this[Ct].has(a)||r.dispose();else if(r instanceof vt||r instanceof K)for(const s of r.values())s.dispose();else if(r instanceof ke)for(const s of r.values())s.dispose()}for(const a in e[W]){const r=this[W][a],s=e[W][a];if(s instanceof Wt)this[Ct].has(a)?r.getChild().copy(t(s.getChild()),t):this.setRef(a,t(s.getChild()),s.getAttributes());else if(s instanceof K||s instanceof vt)for(const i of s.values())this.addRef(a,t(i.getChild()),i.getAttributes());else if(s instanceof ke)for(const i of s.keys()){const o=s.get(i);this.setRefMap(a,i,t(o.getChild()),o.getAttributes())}else It(s)?this[W][a]=JSON.parse(JSON.stringify(s)):Array.isArray(s)||s instanceof ArrayBuffer||ArrayBuffer.isView(s)?this[W][a]=s.slice():this[W][a]=s}return this}equals(e,t=pf){if(this===e)return!0;if(this.propertyType!==e.propertyType)return!1;for(const a in this[W]){if(t.has(a))continue;const r=this[W][a],s=e[W][a];if(r instanceof Wt||s instanceof Wt){if(!lf(r,s))return!1}else if(r instanceof K||s instanceof K||r instanceof vt||s instanceof vt){if(!cf(r,s))return!1}else if(r instanceof ke||s instanceof ke){if(!uf(r,s))return!1}else if(It(r)||It(s)){if(!Mo(r,s))return!1}else if(sa(r)||sa(s)){if(!Do(r,s))return!1}else if(r!==s)return!1}return!0}detach(){return this.graph.disconnectParents(this,e=>e.propertyType!=="Root"),this}listParents(){return this.graph.listParents(this)}}class me extends Tr{getDefaults(){return Object.assign(super.getDefaults(),{extensions:new ke})}getExtension(e){return this.getRefMap("extensions",e)}setExtension(e,t){return t&&t._validateParent(this),this.setRefMap("extensions",e,t)}listExtensions(){return this.listRefMapValues("extensions")}}class F extends me{init(){this.propertyType=E.ACCESSOR}getDefaults(){return Object.assign(super.getDefaults(),{array:null,type:F.Type.SCALAR,componentType:F.ComponentType.FLOAT,normalized:!1,sparse:!1,buffer:null})}static getElementSize(e){switch(e){case F.Type.SCALAR:return 1;case F.Type.VEC2:return 2;case F.Type.VEC3:return 3;case F.Type.VEC4:return 4;case F.Type.MAT2:return 4;case F.Type.MAT3:return 9;case F.Type.MAT4:return 16;default:throw new Error("Unexpected type: "+e)}}static getComponentSize(e){switch(e){case F.ComponentType.BYTE:return 1;case F.ComponentType.UNSIGNED_BYTE:return 1;case F.ComponentType.SHORT:return 2;case F.ComponentType.UNSIGNED_SHORT:return 2;case F.ComponentType.UNSIGNED_INT:return 4;case F.ComponentType.FLOAT:return 4;default:throw new Error("Unexpected component type: "+e)}}getMinNormalized(e){const t=this.getNormalized(),a=this.getElementSize(),r=this.getComponentType();if(this.getMin(e),t)for(let s=0;s<a;s++)e[s]=H.decodeNormalizedInt(e[s],r);return e}getMin(e){const t=this.getArray(),a=this.getCount(),r=this.getElementSize();for(let s=0;s<r;s++)e[s]=1/0;for(let s=0;s<a*r;s+=r)for(let i=0;i<r;i++){const o=t[s+i];Number.isFinite(o)&&(e[i]=Math.min(e[i],o))}return e}getMaxNormalized(e){const t=this.getNormalized(),a=this.getElementSize(),r=this.getComponentType();if(this.getMax(e),t)for(let s=0;s<a;s++)e[s]=H.decodeNormalizedInt(e[s],r);return e}getMax(e){const t=this.get("array"),a=this.getCount(),r=this.getElementSize();for(let s=0;s<r;s++)e[s]=-1/0;for(let s=0;s<a*r;s+=r)for(let i=0;i<r;i++){const o=t[s+i];Number.isFinite(o)&&(e[i]=Math.max(e[i],o))}return e}getCount(){const e=this.get("array");return e?e.length/this.getElementSize():0}getType(){return this.get("type")}setType(e){return this.set("type",e)}getElementSize(){return F.getElementSize(this.get("type"))}getComponentSize(){return this.get("array").BYTES_PER_ELEMENT}getComponentType(){return this.get("componentType")}getNormalized(){return this.get("normalized")}setNormalized(e){return this.set("normalized",e)}getScalar(e){const t=this.getElementSize(),a=this.getComponentType(),r=this.getArray();return this.getNormalized()?H.decodeNormalizedInt(r[e*t],a):r[e*t]}setScalar(e,t){const a=this.getElementSize(),r=this.getComponentType(),s=this.getArray();return this.getNormalized()?s[e*a]=H.encodeNormalizedInt(t,r):s[e*a]=t,this}getElement(e,t){const a=this.getNormalized(),r=this.getElementSize(),s=this.getComponentType(),i=this.getArray();for(let o=0;o<r;o++)a?t[o]=H.decodeNormalizedInt(i[e*r+o],s):t[o]=i[e*r+o];return t}setElement(e,t){const a=this.getNormalized(),r=this.getElementSize(),s=this.getComponentType(),i=this.getArray();for(let o=0;o<r;o++)a?i[e*r+o]=H.encodeNormalizedInt(t[o],s):i[e*r+o]=t[o];return this}getSparse(){return this.get("sparse")}setSparse(e){return this.set("sparse",e)}getBuffer(){return this.getRef("buffer")}setBuffer(e){return this.setRef("buffer",e)}getArray(){return this.get("array")}setArray(e){return this.set("componentType",e?bf(e):F.ComponentType.FLOAT),this.set("array",e),this}getByteLength(){const e=this.get("array");return e?e.byteLength:0}}F.Type={SCALAR:"SCALAR",VEC2:"VEC2",VEC3:"VEC3",VEC4:"VEC4",MAT2:"MAT2",MAT3:"MAT3",MAT4:"MAT4"};F.ComponentType={BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,UNSIGNED_INT:5125,FLOAT:5126};function bf(n){switch(n.constructor){case Float32Array:return F.ComponentType.FLOAT;case Uint32Array:return F.ComponentType.UNSIGNED_INT;case Uint16Array:return F.ComponentType.UNSIGNED_SHORT;case Uint8Array:return F.ComponentType.UNSIGNED_BYTE;case Int16Array:return F.ComponentType.SHORT;case Int8Array:return F.ComponentType.BYTE;default:throw new Error("Unknown accessor componentType.")}}class Po extends me{init(){this.propertyType=E.ANIMATION}getDefaults(){return Object.assign(super.getDefaults(),{channels:new K,samplers:new K})}addChannel(e){return this.addRef("channels",e)}removeChannel(e){return this.removeRef("channels",e)}listChannels(){return this.listRefs("channels")}addSampler(e){return this.addRef("samplers",e)}removeSampler(e){return this.removeRef("samplers",e)}listSamplers(){return this.listRefs("samplers")}}class ga extends me{init(){this.propertyType=E.ANIMATION_CHANNEL}getDefaults(){return Object.assign(super.getDefaults(),{targetPath:null,targetNode:null,sampler:null})}getTargetPath(){return this.get("targetPath")}setTargetPath(e){return this.set("targetPath",e)}getTargetNode(){return this.getRef("targetNode")}setTargetNode(e){return this.setRef("targetNode",e)}getSampler(){return this.getRef("sampler")}setSampler(e){return this.setRef("sampler",e)}}ga.TargetPath={TRANSLATION:"translation",ROTATION:"rotation",SCALE:"scale",WEIGHTS:"weights"};class nn extends me{init(){this.propertyType=E.ANIMATION_SAMPLER}getDefaultAttributes(){return Object.assign(super.getDefaults(),{interpolation:nn.Interpolation.LINEAR,input:null,output:null})}getInterpolation(){return this.get("interpolation")}setInterpolation(e){return this.set("interpolation",e)}getInput(){return this.getRef("input")}setInput(e){return this.setRef("input",e,{usage:Te.OTHER})}getOutput(){return this.getRef("output")}setOutput(e){return this.setRef("output",e,{usage:Te.OTHER})}}nn.Interpolation={LINEAR:"LINEAR",STEP:"STEP",CUBICSPLINE:"CUBICSPLINE"};class Fo extends me{init(){this.propertyType=E.BUFFER}getDefaults(){return Object.assign(super.getDefaults(),{uri:""})}getURI(){return this.get("uri")}setURI(e){return this.set("uri",e)}}class Nt extends me{init(){this.propertyType=E.CAMERA}getDefaults(){return Object.assign(super.getDefaults(),{type:Nt.Type.PERSPECTIVE,znear:.1,zfar:100,aspectRatio:null,yfov:Math.PI*2*50/360,xmag:1,ymag:1})}getType(){return this.get("type")}setType(e){return this.set("type",e)}getZNear(){return this.get("znear")}setZNear(e){return this.set("znear",e)}getZFar(){return this.get("zfar")}setZFar(e){return this.set("zfar",e)}getAspectRatio(){return this.get("aspectRatio")}setAspectRatio(e){return this.set("aspectRatio",e)}getYFov(){return this.get("yfov")}setYFov(e){return this.set("yfov",e)}getXMag(){return this.get("xmag")}setXMag(e){return this.set("xmag",e)}getYMag(){return this.get("ymag")}setYMag(e){return this.set("ymag",e)}}Nt.Type={PERSPECTIVE:"perspective",ORTHOGRAPHIC:"orthographic"};class Z extends Tr{_validateParent(e){if(!this.parentTypes.includes(e.propertyType))throw new Error(`Parent "${e.propertyType}" invalid for child "${this.propertyType}".`)}}Z.EXTENSION_NAME=void 0;class X extends me{init(){this.propertyType=E.TEXTURE_INFO}getDefaults(){return Object.assign(super.getDefaults(),{texCoord:0,magFilter:null,minFilter:null,wrapS:X.WrapMode.REPEAT,wrapT:X.WrapMode.REPEAT})}getTexCoord(){return this.get("texCoord")}setTexCoord(e){return this.set("texCoord",e)}getMagFilter(){return this.get("magFilter")}setMagFilter(e){return this.set("magFilter",e)}getMinFilter(){return this.get("minFilter")}setMinFilter(e){return this.set("minFilter",e)}getWrapS(){return this.get("wrapS")}setWrapS(e){return this.set("wrapS",e)}getWrapT(){return this.get("wrapT")}setWrapT(e){return this.set("wrapT",e)}}X.WrapMode={CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497};X.MagFilter={NEAREST:9728,LINEAR:9729};X.MinFilter={NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987};const{R:Hn,G:Xn,B:Kn,A:mf}=Pe;class Pt extends me{init(){this.propertyType=E.MATERIAL}getDefaults(){return Object.assign(super.getDefaults(),{alphaMode:Pt.AlphaMode.OPAQUE,alphaCutoff:.5,doubleSided:!1,baseColorFactor:[1,1,1,1],baseColorTexture:null,baseColorTextureInfo:new X(this.graph,"baseColorTextureInfo"),emissiveFactor:[0,0,0],emissiveTexture:null,emissiveTextureInfo:new X(this.graph,"emissiveTextureInfo"),normalScale:1,normalTexture:null,normalTextureInfo:new X(this.graph,"normalTextureInfo"),occlusionStrength:1,occlusionTexture:null,occlusionTextureInfo:new X(this.graph,"occlusionTextureInfo"),roughnessFactor:1,metallicFactor:1,metallicRoughnessTexture:null,metallicRoughnessTextureInfo:new X(this.graph,"metallicRoughnessTextureInfo")})}getDoubleSided(){return this.get("doubleSided")}setDoubleSided(e){return this.set("doubleSided",e)}getAlpha(){return this.get("baseColorFactor")[3]}setAlpha(e){const t=this.get("baseColorFactor").slice();return t[3]=e,this.set("baseColorFactor",t)}getAlphaMode(){return this.get("alphaMode")}setAlphaMode(e){return this.set("alphaMode",e)}getAlphaCutoff(){return this.get("alphaCutoff")}setAlphaCutoff(e){return this.set("alphaCutoff",e)}getBaseColorFactor(){return this.get("baseColorFactor")}setBaseColorFactor(e){return this.set("baseColorFactor",e)}getBaseColorTexture(){return this.getRef("baseColorTexture")}getBaseColorTextureInfo(){return this.getRef("baseColorTexture")?this.getRef("baseColorTextureInfo"):null}setBaseColorTexture(e){return this.setRef("baseColorTexture",e,{channels:Hn|Xn|Kn|mf,isColor:!0})}getEmissiveFactor(){return this.get("emissiveFactor")}setEmissiveFactor(e){return this.set("emissiveFactor",e)}getEmissiveTexture(){return this.getRef("emissiveTexture")}getEmissiveTextureInfo(){return this.getRef("emissiveTexture")?this.getRef("emissiveTextureInfo"):null}setEmissiveTexture(e){return this.setRef("emissiveTexture",e,{channels:Hn|Xn|Kn,isColor:!0})}getNormalScale(){return this.get("normalScale")}setNormalScale(e){return this.set("normalScale",e)}getNormalTexture(){return this.getRef("normalTexture")}getNormalTextureInfo(){return this.getRef("normalTexture")?this.getRef("normalTextureInfo"):null}setNormalTexture(e){return this.setRef("normalTexture",e,{channels:Hn|Xn|Kn})}getOcclusionStrength(){return this.get("occlusionStrength")}setOcclusionStrength(e){return this.set("occlusionStrength",e)}getOcclusionTexture(){return this.getRef("occlusionTexture")}getOcclusionTextureInfo(){return this.getRef("occlusionTexture")?this.getRef("occlusionTextureInfo"):null}setOcclusionTexture(e){return this.setRef("occlusionTexture",e,{channels:Hn})}getRoughnessFactor(){return this.get("roughnessFactor")}setRoughnessFactor(e){return this.set("roughnessFactor",e)}getMetallicFactor(){return this.get("metallicFactor")}setMetallicFactor(e){return this.set("metallicFactor",e)}getMetallicRoughnessTexture(){return this.getRef("metallicRoughnessTexture")}getMetallicRoughnessTextureInfo(){return this.getRef("metallicRoughnessTexture")?this.getRef("metallicRoughnessTextureInfo"):null}setMetallicRoughnessTexture(e){return this.setRef("metallicRoughnessTexture",e,{channels:Xn|Kn})}}Pt.AlphaMode={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};class ko extends me{init(){this.propertyType=E.MESH}getDefaults(){return Object.assign(super.getDefaults(),{weights:[],primitives:new K})}addPrimitive(e){return this.addRef("primitives",e)}removePrimitive(e){return this.removeRef("primitives",e)}listPrimitives(){return this.listRefs("primitives")}getWeights(){return this.get("weights")}setWeights(e){return this.set("weights",e)}}class No extends me{init(){this.propertyType=E.NODE}getDefaults(){return Object.assign(super.getDefaults(),{translation:[0,0,0],rotation:[0,0,0,1],scale:[1,1,1],weights:[],camera:null,mesh:null,skin:null,children:new K})}copy(e,t=wt){if(t===wt)throw new Error("Node cannot be copied.");return super.copy(e,t)}getTranslation(){return this.get("translation")}getRotation(){return this.get("rotation")}getScale(){return this.get("scale")}setTranslation(e){return this.set("translation",e)}setRotation(e){return this.set("rotation",e)}setScale(e){return this.set("scale",e)}getMatrix(){return H.compose(this.get("translation"),this.get("rotation"),this.get("scale"),[])}setMatrix(e){const t=this.get("translation").slice(),a=this.get("rotation").slice(),r=this.get("scale").slice();return H.decompose(e,t,a,r),this.set("translation",t).set("rotation",a).set("scale",r)}getWorldTranslation(){const e=[0,0,0];return H.decompose(this.getWorldMatrix(),e,[0,0,0,1],[1,1,1]),e}getWorldRotation(){const e=[0,0,0,1];return H.decompose(this.getWorldMatrix(),[0,0,0],e,[1,1,1]),e}getWorldScale(){const e=[1,1,1];return H.decompose(this.getWorldMatrix(),[0,0,0],[0,0,0,1],e),e}getWorldMatrix(){const e=[];for(let r=this;r!=null;r=r.getParentNode())e.push(r);let t;const a=e.pop().getMatrix();for(;t=e.pop();)rf(a,a,t.getMatrix());return a}addChild(e){const t=e.getParentNode();t&&t.removeChild(e);for(const a of e.listParents())a.propertyType===E.SCENE&&a.removeChild(e);return this.addRef("children",e)}removeChild(e){return this.removeRef("children",e)}listChildren(){return this.listRefs("children")}getParentNode(){for(const e of this.listParents())if(e.propertyType===E.NODE)return e;return null}getMesh(){return this.getRef("mesh")}setMesh(e){return this.setRef("mesh",e)}getCamera(){return this.getRef("camera")}setCamera(e){return this.setRef("camera",e)}getSkin(){return this.getRef("skin")}setSkin(e){return this.setRef("skin",e)}getWeights(){return this.get("weights")}setWeights(e){return this.set("weights",e)}traverse(e){e(this);for(const t of this.listChildren())t.traverse(e);return this}}class Ne extends me{init(){this.propertyType=E.PRIMITIVE}getDefaults(){return Object.assign(super.getDefaults(),{mode:Ne.Mode.TRIANGLES,material:null,indices:null,attributes:new ke,targets:new K})}getIndices(){return this.getRef("indices")}setIndices(e){return this.setRef("indices",e,{usage:Te.ELEMENT_ARRAY_BUFFER})}getAttribute(e){return this.getRefMap("attributes",e)}setAttribute(e,t){return this.setRefMap("attributes",e,t,{usage:Te.ARRAY_BUFFER})}listAttributes(){return this.listRefMapValues("attributes")}listSemantics(){return this.listRefMapKeys("attributes")}getMaterial(){return this.getRef("material")}setMaterial(e){return this.setRef("material",e)}getMode(){return this.get("mode")}setMode(e){return this.set("mode",e)}listTargets(){return this.listRefs("targets")}addTarget(e){return this.addRef("targets",e)}removeTarget(e){return this.removeRef("targets",e)}}Ne.Mode={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6};class gf extends Tr{init(){this.propertyType=E.PRIMITIVE_TARGET}getDefaults(){return Object.assign(super.getDefaults(),{attributes:new ke})}getAttribute(e){return this.getRefMap("attributes",e)}setAttribute(e,t){return this.setRefMap("attributes",e,t,{usage:Te.ARRAY_BUFFER})}listAttributes(){return this.listRefMapValues("attributes")}listSemantics(){return this.listRefMapKeys("attributes")}}function fe(){return fe=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var a in t)({}).hasOwnProperty.call(t,a)&&(n[a]=t[a])}return n},fe.apply(null,arguments)}class jo extends me{init(){this.propertyType=E.SCENE}getDefaults(){return Object.assign(super.getDefaults(),{children:new K})}copy(e,t=wt){if(t===wt)throw new Error("Scene cannot be copied.");return super.copy(e,t)}addChild(e){const t=e.getParentNode();return t&&t.removeChild(e),this.addRef("children",e)}removeChild(e){return this.removeRef("children",e)}listChildren(){return this.listRefs("children")}traverse(e){for(const t of this.listChildren())t.traverse(e);return this}}class Bo extends me{init(){this.propertyType=E.SKIN}getDefaults(){return Object.assign(super.getDefaults(),{skeleton:null,inverseBindMatrices:null,joints:new K})}getSkeleton(){return this.getRef("skeleton")}setSkeleton(e){return this.setRef("skeleton",e)}getInverseBindMatrices(){return this.getRef("inverseBindMatrices")}setInverseBindMatrices(e){return this.setRef("inverseBindMatrices",e,{usage:Te.INVERSE_BIND_MATRICES})}addJoint(e){return this.addRef("joints",e)}removeJoint(e){return this.removeRef("joints",e)}listJoints(){return this.listRefs("joints")}}class Oo extends me{init(){this.propertyType=E.TEXTURE}getDefaults(){return Object.assign(super.getDefaults(),{image:null,mimeType:"",uri:""})}getMimeType(){return this.get("mimeType")||Ue.extensionToMimeType(Yt.extension(this.get("uri")))}setMimeType(e){return this.set("mimeType",e)}getURI(){return this.get("uri")}setURI(e){this.set("uri",e);const t=Ue.extensionToMimeType(Yt.extension(e));return t&&this.set("mimeType",t),this}getImage(){return this.get("image")}setImage(e){return this.set("image",B.assertView(e))}getSize(){const e=this.get("image");return e?Ue.getSize(e,this.getMimeType()):null}}class Vo extends me{init(){this.propertyType=E.ROOT}getDefaults(){return Object.assign(super.getDefaults(),{asset:{generator:`glTF-Transform ${Ro}`,version:"2.0"},defaultScene:null,accessors:new K,animations:new K,buffers:new K,cameras:new K,materials:new K,meshes:new K,nodes:new K,scenes:new K,skins:new K,textures:new K})}constructor(e){super(e),this._extensions=new Set,e.addEventListener("node:create",t=>{this._addChildOfRoot(t.target)})}clone(){throw new Error("Root cannot be cloned.")}copy(e,t=wt){if(t===wt)throw new Error("Root cannot be copied.");this.set("asset",fe({},e.get("asset"))),this.setName(e.getName()),this.setExtras(fe({},e.getExtras())),this.setDefaultScene(e.getDefaultScene()?t(e.getDefaultScene()):null);for(const a of e.listRefMapKeys("extensions")){const r=e.getExtension(a);this.setExtension(a,t(r))}return this}_addChildOfRoot(e){return e instanceof jo?this.addRef("scenes",e):e instanceof No?this.addRef("nodes",e):e instanceof Nt?this.addRef("cameras",e):e instanceof Bo?this.addRef("skins",e):e instanceof ko?this.addRef("meshes",e):e instanceof Pt?this.addRef("materials",e):e instanceof Oo?this.addRef("textures",e):e instanceof Po?this.addRef("animations",e):e instanceof F?this.addRef("accessors",e):e instanceof Fo&&this.addRef("buffers",e),this}getAsset(){return this.get("asset")}listExtensionsUsed(){return Array.from(this._extensions)}listExtensionsRequired(){return this.listExtensionsUsed().filter(e=>e.isRequired())}_enableExtension(e){return this._extensions.add(e),this}_disableExtension(e){return this._extensions.delete(e),this}listScenes(){return this.listRefs("scenes")}setDefaultScene(e){return this.setRef("defaultScene",e)}getDefaultScene(){return this.getRef("defaultScene")}listNodes(){return this.listRefs("nodes")}listCameras(){return this.listRefs("cameras")}listSkins(){return this.listRefs("skins")}listMeshes(){return this.listRefs("meshes")}listMaterials(){return this.listRefs("materials")}listTextures(){return this.listRefs("textures")}listAnimations(){return this.listRefs("animations")}listAccessors(){return this.listRefs("accessors")}listBuffers(){return this.listRefs("buffers")}}class En{static fromGraph(e){return En._GRAPH_DOCUMENTS.get(e)||null}constructor(){this._graph=new Jh,this._root=new Vo(this._graph),this._logger=Me.DEFAULT_INSTANCE,En._GRAPH_DOCUMENTS.set(this._graph,this)}getRoot(){return this._root}getGraph(){return this._graph}getLogger(){return this._logger}setLogger(e){return this._logger=e,this}clone(){throw new Error("Use 'cloneDocument(source)' from '@gltf-transform/functions'.")}merge(e){throw new Error("Use 'mergeDocuments(target, source)' from '@gltf-transform/functions'.")}async transform(...e){const t=e.map(a=>a.name);for(const a of e)await a(this,{stack:t});return this}createExtension(e){const t=e.EXTENSION_NAME;return this.getRoot().listExtensionsUsed().find(r=>r.extensionName===t)||new e(this)}disposeExtension(e){const t=this.getRoot().listExtensionsUsed().find(a=>a.extensionName===e);t&&t.dispose()}createScene(e=""){return new jo(this._graph,e)}createNode(e=""){return new No(this._graph,e)}createCamera(e=""){return new Nt(this._graph,e)}createSkin(e=""){return new Bo(this._graph,e)}createMesh(e=""){return new ko(this._graph,e)}createPrimitive(){return new Ne(this._graph)}createPrimitiveTarget(e=""){return new gf(this._graph,e)}createMaterial(e=""){return new Pt(this._graph,e)}createTexture(e=""){return new Oo(this._graph,e)}createAnimation(e=""){return new Po(this._graph,e)}createAnimationChannel(e=""){return new ga(this._graph,e)}createAnimationSampler(e=""){return new nn(this._graph,e)}createAccessor(e="",t=null){return t||(t=this.getRoot().listBuffers()[0]),new F(this._graph,e).setBuffer(t)}createBuffer(e=""){return new Fo(this._graph,e)}}En._GRAPH_DOCUMENTS=new WeakMap;class J{constructor(e){this.extensionName="",this.prereadTypes=[],this.prewriteTypes=[],this.readDependencies=[],this.writeDependencies=[],this.document=void 0,this.required=!1,this.properties=new Set,this._listener=void 0,this.document=e,e.getRoot()._enableExtension(this),this._listener=a=>{const r=a,s=r.target;s instanceof Z&&s.extensionName===this.extensionName&&(r.type==="node:create"&&this._addExtensionProperty(s),r.type==="node:dispose"&&this._removeExtensionProperty(s))};const t=e.getGraph();t.addEventListener("node:create",this._listener),t.addEventListener("node:dispose",this._listener)}dispose(){this.document.getRoot()._disableExtension(this);const e=this.document.getGraph();e.removeEventListener("node:create",this._listener),e.removeEventListener("node:dispose",this._listener);for(const t of this.properties)t.dispose()}static register(){}isRequired(){return this.required}setRequired(e){return this.required=e,this}listProperties(){return Array.from(this.properties)}_addExtensionProperty(e){return this.properties.add(e),this}_removeExtensionProperty(e){return this.properties.delete(e),this}install(e,t){return this}preread(e,t){return this}prewrite(e,t){return this}}J.EXTENSION_NAME=void 0;class vf{constructor(e){this.jsonDoc=void 0,this.buffers=[],this.bufferViews=[],this.bufferViewBuffers=[],this.accessors=[],this.textures=[],this.textureInfos=new Map,this.materials=[],this.meshes=[],this.cameras=[],this.nodes=[],this.skins=[],this.animations=[],this.scenes=[],this.jsonDoc=e}setTextureInfo(e,t){this.textureInfos.set(e,t),t.texCoord!==void 0&&e.setTexCoord(t.texCoord),t.extras!==void 0&&e.setExtras(t.extras);const a=this.jsonDoc.json.textures[t.index];if(a.sampler===void 0)return;const r=this.jsonDoc.json.samplers[a.sampler];r.magFilter!==void 0&&e.setMagFilter(r.magFilter),r.minFilter!==void 0&&e.setMinFilter(r.minFilter),r.wrapS!==void 0&&e.setWrapS(r.wrapS),r.wrapT!==void 0&&e.setWrapT(r.wrapT)}}const Ks={logger:Me.DEFAULT_INSTANCE,extensions:[],dependencies:{}},xf=new Set([E.BUFFER,E.TEXTURE,E.MATERIAL,E.MESH,E.PRIMITIVE,E.NODE,E.SCENE]);class Sf{static read(e,t=Ks){const a=fe({},Ks,t),{json:r}=e,s=new En().setLogger(a.logger);this.validate(e,a);const i=new vf(e),o=r.asset,l=s.getRoot().getAsset();o.copyright&&(l.copyright=o.copyright),o.extras&&(l.extras=o.extras),r.extras!==void 0&&s.getRoot().setExtras(fe({},r.extras));const c=r.extensionsUsed||[],h=r.extensionsRequired||[];a.extensions.sort((f,w)=>f.EXTENSION_NAME>w.EXTENSION_NAME?1:-1);for(const f of a.extensions)if(c.includes(f.EXTENSION_NAME)){const w=s.createExtension(f).setRequired(h.includes(f.EXTENSION_NAME)),R=w.prereadTypes.filter(I=>!xf.has(I));R.length&&a.logger.warn(`Preread hooks for some types (${R.join()}), requested by extension ${w.extensionName}, are unsupported. Please file an issue or a PR.`);for(const I of w.readDependencies)w.install(I,a.dependencies[I])}const d=r.buffers||[];s.getRoot().listExtensionsUsed().filter(f=>f.prereadTypes.includes(E.BUFFER)).forEach(f=>f.preread(i,E.BUFFER)),i.buffers=d.map(f=>{const w=s.createBuffer(f.name);return f.extras&&w.setExtras(f.extras),f.uri&&f.uri.indexOf("__")!==0&&w.setURI(f.uri),w});const m=r.bufferViews||[];i.bufferViewBuffers=m.map((f,w)=>{if(!i.bufferViews[w]){const R=e.json.buffers[f.buffer],I=R.uri?e.resources[R.uri]:e.resources[qt],D=f.byteOffset||0;i.bufferViews[w]=B.toView(I,D,f.byteLength)}return i.buffers[f.buffer]});const b=r.accessors||[];i.accessors=b.map(f=>{const w=i.bufferViewBuffers[f.bufferView],R=s.createAccessor(f.name,w).setType(f.type);return f.extras&&R.setExtras(f.extras),f.normalized!==void 0&&R.setNormalized(f.normalized),f.bufferView===void 0||R.setArray(Zn(f,i)),R});const _=r.images||[],p=r.textures||[];s.getRoot().listExtensionsUsed().filter(f=>f.prereadTypes.includes(E.TEXTURE)).forEach(f=>f.preread(i,E.TEXTURE)),i.textures=_.map(f=>{const w=s.createTexture(f.name);if(f.extras&&w.setExtras(f.extras),f.bufferView!==void 0){const R=r.bufferViews[f.bufferView],I=e.json.buffers[R.buffer],D=I.uri?e.resources[I.uri]:e.resources[qt],M=R.byteOffset||0,A=R.byteLength,k=D.slice(M,M+A);w.setImage(k)}else f.uri!==void 0&&(w.setImage(e.resources[f.uri]),f.uri.indexOf("__")!==0&&w.setURI(f.uri));if(f.mimeType!==void 0)w.setMimeType(f.mimeType);else if(f.uri){const R=Yt.extension(f.uri);w.setMimeType(Ue.extensionToMimeType(R))}return w}),s.getRoot().listExtensionsUsed().filter(f=>f.prereadTypes.includes(E.MATERIAL)).forEach(f=>f.preread(i,E.MATERIAL));const v=r.materials||[];i.materials=v.map(f=>{const w=s.createMaterial(f.name);f.extras&&w.setExtras(f.extras),f.alphaMode!==void 0&&w.setAlphaMode(f.alphaMode),f.alphaCutoff!==void 0&&w.setAlphaCutoff(f.alphaCutoff),f.doubleSided!==void 0&&w.setDoubleSided(f.doubleSided);const R=f.pbrMetallicRoughness||{};if(R.baseColorFactor!==void 0&&w.setBaseColorFactor(R.baseColorFactor),f.emissiveFactor!==void 0&&w.setEmissiveFactor(f.emissiveFactor),R.metallicFactor!==void 0&&w.setMetallicFactor(R.metallicFactor),R.roughnessFactor!==void 0&&w.setRoughnessFactor(R.roughnessFactor),R.baseColorTexture!==void 0){const I=R.baseColorTexture,D=i.textures[p[I.index].source];w.setBaseColorTexture(D),i.setTextureInfo(w.getBaseColorTextureInfo(),I)}if(f.emissiveTexture!==void 0){const I=f.emissiveTexture,D=i.textures[p[I.index].source];w.setEmissiveTexture(D),i.setTextureInfo(w.getEmissiveTextureInfo(),I)}if(f.normalTexture!==void 0){const I=f.normalTexture,D=i.textures[p[I.index].source];w.setNormalTexture(D),i.setTextureInfo(w.getNormalTextureInfo(),I),f.normalTexture.scale!==void 0&&w.setNormalScale(f.normalTexture.scale)}if(f.occlusionTexture!==void 0){const I=f.occlusionTexture,D=i.textures[p[I.index].source];w.setOcclusionTexture(D),i.setTextureInfo(w.getOcclusionTextureInfo(),I),f.occlusionTexture.strength!==void 0&&w.setOcclusionStrength(f.occlusionTexture.strength)}if(R.metallicRoughnessTexture!==void 0){const I=R.metallicRoughnessTexture,D=i.textures[p[I.index].source];w.setMetallicRoughnessTexture(D),i.setTextureInfo(w.getMetallicRoughnessTextureInfo(),I)}return w}),s.getRoot().listExtensionsUsed().filter(f=>f.prereadTypes.includes(E.MESH)).forEach(f=>f.preread(i,E.MESH));const u=r.meshes||[];s.getRoot().listExtensionsUsed().filter(f=>f.prereadTypes.includes(E.PRIMITIVE)).forEach(f=>f.preread(i,E.PRIMITIVE)),i.meshes=u.map(f=>{const w=s.createMesh(f.name);return f.extras&&w.setExtras(f.extras),f.weights!==void 0&&w.setWeights(f.weights),(f.primitives||[]).forEach(I=>{const D=s.createPrimitive();I.extras&&D.setExtras(I.extras),I.material!==void 0&&D.setMaterial(i.materials[I.material]),I.mode!==void 0&&D.setMode(I.mode);for(const[k,P]of Object.entries(I.attributes||{}))D.setAttribute(k,i.accessors[P]);I.indices!==void 0&&D.setIndices(i.accessors[I.indices]);const M=f.extras&&f.extras.targetNames||[];(I.targets||[]).forEach((k,P)=>{const N=M[P]||P.toString(),O=s.createPrimitiveTarget(N);for(const[j,L]of Object.entries(k))O.setAttribute(j,i.accessors[L]);D.addTarget(O)}),w.addPrimitive(D)}),w});const S=r.cameras||[];i.cameras=S.map(f=>{const w=s.createCamera(f.name).setType(f.type);if(f.extras&&w.setExtras(f.extras),f.type===Nt.Type.PERSPECTIVE){const R=f.perspective;w.setYFov(R.yfov),w.setZNear(R.znear),R.zfar!==void 0&&w.setZFar(R.zfar),R.aspectRatio!==void 0&&w.setAspectRatio(R.aspectRatio)}else{const R=f.orthographic;w.setZNear(R.znear).setZFar(R.zfar).setXMag(R.xmag).setYMag(R.ymag)}return w});const g=r.nodes||[];s.getRoot().listExtensionsUsed().filter(f=>f.prereadTypes.includes(E.NODE)).forEach(f=>f.preread(i,E.NODE)),i.nodes=g.map(f=>{const w=s.createNode(f.name);if(f.extras&&w.setExtras(f.extras),f.translation!==void 0&&w.setTranslation(f.translation),f.rotation!==void 0&&w.setRotation(f.rotation),f.scale!==void 0&&w.setScale(f.scale),f.matrix!==void 0){const R=[0,0,0],I=[0,0,0,1],D=[1,1,1];H.decompose(f.matrix,R,I,D),w.setTranslation(R),w.setRotation(I),w.setScale(D)}return f.weights!==void 0&&w.setWeights(f.weights),w});const x=r.skins||[];i.skins=x.map(f=>{const w=s.createSkin(f.name);f.extras&&w.setExtras(f.extras),f.inverseBindMatrices!==void 0&&w.setInverseBindMatrices(i.accessors[f.inverseBindMatrices]),f.skeleton!==void 0&&w.setSkeleton(i.nodes[f.skeleton]);for(const R of f.joints)w.addJoint(i.nodes[R]);return w}),g.map((f,w)=>{const R=i.nodes[w];(f.children||[]).forEach(D=>R.addChild(i.nodes[D])),f.mesh!==void 0&&R.setMesh(i.meshes[f.mesh]),f.camera!==void 0&&R.setCamera(i.cameras[f.camera]),f.skin!==void 0&&R.setSkin(i.skins[f.skin])});const T=r.animations||[];i.animations=T.map(f=>{const w=s.createAnimation(f.name);f.extras&&w.setExtras(f.extras);const I=(f.samplers||[]).map(M=>{const A=s.createAnimationSampler().setInput(i.accessors[M.input]).setOutput(i.accessors[M.output]).setInterpolation(M.interpolation||nn.Interpolation.LINEAR);return M.extras&&A.setExtras(M.extras),w.addSampler(A),A});return(f.channels||[]).forEach(M=>{const A=s.createAnimationChannel().setSampler(I[M.sampler]).setTargetPath(M.target.path);M.target.node!==void 0&&A.setTargetNode(i.nodes[M.target.node]),M.extras&&A.setExtras(M.extras),w.addChannel(A)}),w});const C=r.scenes||[];return s.getRoot().listExtensionsUsed().filter(f=>f.prereadTypes.includes(E.SCENE)).forEach(f=>f.preread(i,E.SCENE)),i.scenes=C.map(f=>{const w=s.createScene(f.name);return f.extras&&w.setExtras(f.extras),(f.nodes||[]).map(I=>i.nodes[I]).forEach(I=>w.addChild(I)),w}),r.scene!==void 0&&s.getRoot().setDefaultScene(i.scenes[r.scene]),s.getRoot().listExtensionsUsed().forEach(f=>f.read(i)),b.forEach((f,w)=>{const R=i.accessors[w],I=!!f.sparse,D=!f.bufferView&&!R.getArray();(I||D)&&R.setSparse(!0).setArray(wf(f,i))}),s}static validate(e,t){const a=e.json;if(a.asset.version!=="2.0")throw new Error(`Unsupported glTF version, "${a.asset.version}".`);if(a.extensionsRequired){for(const r of a.extensionsRequired)if(!t.extensions.find(s=>s.EXTENSION_NAME===r))throw new Error(`Missing required extension, "${r}".`)}if(a.extensionsUsed)for(const r of a.extensionsUsed)t.extensions.find(s=>s.EXTENSION_NAME===r)||t.logger.warn(`Missing optional extension, "${r}".`)}}function Tf(n,e){const t=e.jsonDoc,a=e.bufferViews[n.bufferView],r=t.json.bufferViews[n.bufferView],s=ba[n.componentType],i=F.getElementSize(n.type),o=s.BYTES_PER_ELEMENT,l=n.byteOffset||0,c=new s(n.count*i),h=new DataView(a.buffer,a.byteOffset,a.byteLength),d=r.byteStride;for(let m=0;m<n.count;m++)for(let b=0;b<i;b++){const _=l+m*d+b*o;let p;switch(n.componentType){case F.ComponentType.FLOAT:p=h.getFloat32(_,!0);break;case F.ComponentType.UNSIGNED_INT:p=h.getUint32(_,!0);break;case F.ComponentType.UNSIGNED_SHORT:p=h.getUint16(_,!0);break;case F.ComponentType.UNSIGNED_BYTE:p=h.getUint8(_);break;case F.ComponentType.SHORT:p=h.getInt16(_,!0);break;case F.ComponentType.BYTE:p=h.getInt8(_);break;default:throw new Error(`Unexpected componentType "${n.componentType}".`)}c[m*i+b]=p}return c}function Zn(n,e){const t=e.jsonDoc,a=e.bufferViews[n.bufferView],r=t.json.bufferViews[n.bufferView],s=ba[n.componentType],i=F.getElementSize(n.type),o=s.BYTES_PER_ELEMENT,l=i*o;if(r.byteStride!==void 0&&r.byteStride!==l)return Tf(n,e);const c=a.byteOffset+(n.byteOffset||0),h=n.count*i*o;return new s(a.buffer.slice(c,c+h))}function wf(n,e){const t=ba[n.componentType],a=F.getElementSize(n.type);let r;n.bufferView!==void 0?r=Zn(n,e):r=new t(n.count*a);const s=n.sparse;if(!s)return r;const i=s.count,o=fe({},n,s.indices,{count:i,type:"SCALAR"}),l=fe({},n,s.values,{count:i}),c=Zn(o,e),h=Zn(l,e);for(let d=0;d<o.count;d++)for(let m=0;m<a;m++)r[c[d]*a+m]=h[d*a+m];return r}var Cn;(function(n){n[n.ARRAY_BUFFER=34962]="ARRAY_BUFFER",n[n.ELEMENT_ARRAY_BUFFER=34963]="ELEMENT_ARRAY_BUFFER"})(Cn||(Cn={}));class Ge{constructor(e,t,a){this._doc=void 0,this.jsonDoc=void 0,this.options=void 0,this.accessorIndexMap=new Map,this.animationIndexMap=new Map,this.bufferIndexMap=new Map,this.cameraIndexMap=new Map,this.skinIndexMap=new Map,this.materialIndexMap=new Map,this.meshIndexMap=new Map,this.nodeIndexMap=new Map,this.imageIndexMap=new Map,this.textureDefIndexMap=new Map,this.textureInfoDefMap=new Map,this.samplerDefIndexMap=new Map,this.sceneIndexMap=new Map,this.imageBufferViews=[],this.otherBufferViews=new Map,this.otherBufferViewsIndexMap=new Map,this.extensionData={},this.bufferURIGenerator=void 0,this.imageURIGenerator=void 0,this.logger=void 0,this._accessorUsageMap=new Map,this.accessorUsageGroupedByParent=new Set(["ARRAY_BUFFER"]),this.accessorParents=new Map,this._doc=e,this.jsonDoc=t,this.options=a;const r=e.getRoot(),s=r.listBuffers().length,i=r.listTextures().length;this.bufferURIGenerator=new qs(s>1,()=>a.basename||"buffer"),this.imageURIGenerator=new qs(i>1,o=>yf(e,o)||a.basename||"texture"),this.logger=e.getLogger()}createTextureInfoDef(e,t){const a={magFilter:t.getMagFilter()||void 0,minFilter:t.getMinFilter()||void 0,wrapS:t.getWrapS(),wrapT:t.getWrapT()},r=JSON.stringify(a);this.samplerDefIndexMap.has(r)||(this.samplerDefIndexMap.set(r,this.jsonDoc.json.samplers.length),this.jsonDoc.json.samplers.push(a));const s={source:this.imageIndexMap.get(e),sampler:this.samplerDefIndexMap.get(r)},i=JSON.stringify(s);this.textureDefIndexMap.has(i)||(this.textureDefIndexMap.set(i,this.jsonDoc.json.textures.length),this.jsonDoc.json.textures.push(s));const o={index:this.textureDefIndexMap.get(i)};return t.getTexCoord()!==0&&(o.texCoord=t.getTexCoord()),Object.keys(t.getExtras()).length>0&&(o.extras=t.getExtras()),this.textureInfoDefMap.set(t,o),o}createPropertyDef(e){const t={};return e.getName()&&(t.name=e.getName()),Object.keys(e.getExtras()).length>0&&(t.extras=e.getExtras()),t}createAccessorDef(e){const t=this.createPropertyDef(e);return t.type=e.getType(),t.componentType=e.getComponentType(),t.count=e.getCount(),this._doc.getGraph().listParentEdges(e).some(r=>r.getName()==="attributes"&&r.getAttributes().key==="POSITION"||r.getName()==="input")&&(t.max=e.getMax([]).map(Math.fround),t.min=e.getMin([]).map(Math.fround)),e.getNormalized()&&(t.normalized=e.getNormalized()),t}createImageData(e,t,a){if(this.options.format===St.GLB)this.imageBufferViews.push(t),e.bufferView=this.jsonDoc.json.bufferViews.length,this.jsonDoc.json.bufferViews.push({buffer:0,byteOffset:-1,byteLength:t.byteLength});else{const r=Ue.mimeTypeToExtension(a.getMimeType());e.uri=this.imageURIGenerator.createURI(a,r),this.assignResourceURI(e.uri,t,!1)}}assignResourceURI(e,t,a){const r=this.jsonDoc.resources;if(!(e in r)){r[e]=t;return}if(t===r[e]){this.logger.warn(`Duplicate resource URI, "${e}".`);return}const s=`Resource URI "${e}" already assigned to different data.`;if(!a){this.logger.warn(s);return}throw new Error(s)}getAccessorUsage(e){const t=this._accessorUsageMap.get(e);if(t)return t;if(e.getSparse())return Te.SPARSE;for(const a of this._doc.getGraph().listParentEdges(e)){const{usage:r}=a.getAttributes();if(r)return r;a.getParent().propertyType!==E.ROOT&&this.logger.warn(`Missing attribute ".usage" on edge, "${a.getName()}".`)}return Te.OTHER}addAccessorToUsageGroup(e,t){const a=this._accessorUsageMap.get(e);if(a&&a!==t)throw new Error(`Accessor with usage "${a}" cannot be reused as "${t}".`);return this._accessorUsageMap.set(e,t),this}}Ge.BufferViewTarget=Cn;Ge.BufferViewUsage=Te;Ge.USAGE_TO_TARGET={[Te.ARRAY_BUFFER]:Cn.ARRAY_BUFFER,[Te.ELEMENT_ARRAY_BUFFER]:Cn.ELEMENT_ARRAY_BUFFER};class qs{constructor(e,t){this.multiple=void 0,this.basename=void 0,this.counter={},this.multiple=e,this.basename=t}createURI(e,t){if(e.getURI())return e.getURI();if(this.multiple){const a=this.basename(e);return this.counter[a]=this.counter[a]||1,`${a}_${this.counter[a]++}.${t}`}else return`${this.basename(e)}.${t}`}}function yf(n,e){const t=n.getGraph().listParentEdges(e).find(a=>a.getParent()!==n.getRoot());return t?t.getName().replace(/texture$/i,""):""}const{BufferViewUsage:qn}=Ge,{UNSIGNED_INT:Ef,UNSIGNED_SHORT:Cf,UNSIGNED_BYTE:If}=F.ComponentType,Rf=new Set([E.ACCESSOR,E.BUFFER,E.MATERIAL,E.MESH]);class Af{static write(e,t){const a=e.getGraph(),r=e.getRoot(),s={asset:fe({generator:`glTF-Transform ${Ro}`},r.getAsset()),extras:fe({},r.getExtras())},i={json:s,resources:{}},o=new Ge(e,i,t),l=t.logger||Me.DEFAULT_INSTANCE,c=new Set(t.extensions.map(u=>u.EXTENSION_NAME)),h=e.getRoot().listExtensionsUsed().filter(u=>c.has(u.extensionName)).sort((u,S)=>u.extensionName>S.extensionName?1:-1),d=e.getRoot().listExtensionsRequired().filter(u=>c.has(u.extensionName)).sort((u,S)=>u.extensionName>S.extensionName?1:-1);h.length<e.getRoot().listExtensionsUsed().length&&l.warn("Some extensions were not registered for I/O, and will not be written.");for(const u of h){const S=u.prewriteTypes.filter(g=>!Rf.has(g));S.length&&l.warn(`Prewrite hooks for some types (${S.join()}), requested by extension ${u.extensionName}, are unsupported. Please file an issue or a PR.`);for(const g of u.writeDependencies)u.install(g,t.dependencies[g])}function m(u,S,g,x){const T=[];let C=0;for(const R of u){const I=o.createAccessorDef(R);I.bufferView=s.bufferViews.length;const D=R.getArray(),M=B.pad(B.toView(D));I.byteOffset=C,C+=M.byteLength,T.push(M),o.accessorIndexMap.set(R,s.accessors.length),s.accessors.push(I)}const f=B.concat(T),w={buffer:S,byteOffset:g,byteLength:f.byteLength};return x&&(w.target=x),s.bufferViews.push(w),{buffers:T,byteLength:C}}function b(u,S,g){const x=u[0].getCount();let T=0;for(const I of u){const D=o.createAccessorDef(I);D.bufferView=s.bufferViews.length,D.byteOffset=T;const M=I.getElementSize(),A=I.getComponentSize();T+=B.padNumber(M*A),o.accessorIndexMap.set(I,s.accessors.length),s.accessors.push(D)}const C=x*T,f=new ArrayBuffer(C),w=new DataView(f);for(let I=0;I<x;I++){let D=0;for(const M of u){const A=M.getElementSize(),k=M.getComponentSize(),P=M.getComponentType(),N=M.getArray();for(let O=0;O<A;O++){const j=I*T+D+O*k,L=N[I*A+O];switch(P){case F.ComponentType.FLOAT:w.setFloat32(j,L,!0);break;case F.ComponentType.BYTE:w.setInt8(j,L);break;case F.ComponentType.SHORT:w.setInt16(j,L,!0);break;case F.ComponentType.UNSIGNED_BYTE:w.setUint8(j,L);break;case F.ComponentType.UNSIGNED_SHORT:w.setUint16(j,L,!0);break;case F.ComponentType.UNSIGNED_INT:w.setUint32(j,L,!0);break;default:throw new Error("Unexpected component type: "+P)}}D+=B.padNumber(A*k)}}const R={buffer:S,byteOffset:g,byteLength:C,byteStride:T,target:Ge.BufferViewTarget.ARRAY_BUFFER};return s.bufferViews.push(R),{byteLength:C,buffers:[new Uint8Array(f)]}}function _(u,S,g){const x=[];let T=0;const C=new Map;let f=-1/0,w=!1;for(const P of u){const N=o.createAccessorDef(P);s.accessors.push(N),o.accessorIndexMap.set(P,s.accessors.length-1);const O=[],j=[],L=[],Se=new Array(P.getElementSize()).fill(0);for(let de=0,je=P.getCount();de<je;de++)if(P.getElement(de,L),!H.eq(L,Se,0)){f=Math.max(de,f),O.push(de);for(let Be=0;Be<L.length;Be++)j.push(L[Be])}const le=O.length,ce={accessorDef:N,count:le};if(C.set(P,ce),le===0)continue;le>P.getCount()/2&&(w=!0);const Fe=ba[P.getComponentType()];ce.indices=O,ce.values=new Fe(j)}if(!Number.isFinite(f))return{buffers:x,byteLength:T};w&&l.warn("Some sparse accessors have >50% non-zero elements, which may increase file size.");const R=f<255?Uint8Array:f<65535?Uint16Array:Uint32Array,I=f<255?If:f<65535?Cf:Ef,D={buffer:S,byteOffset:g+T,byteLength:0};for(const P of u){const N=C.get(P);if(N.count===0)continue;N.indicesByteOffset=D.byteLength;const O=B.pad(B.toView(new R(N.indices)));x.push(O),T+=O.byteLength,D.byteLength+=O.byteLength}s.bufferViews.push(D);const M=s.bufferViews.length-1,A={buffer:S,byteOffset:g+T,byteLength:0};for(const P of u){const N=C.get(P);if(N.count===0)continue;N.valuesByteOffset=A.byteLength;const O=B.pad(B.toView(N.values));x.push(O),T+=O.byteLength,A.byteLength+=O.byteLength}s.bufferViews.push(A);const k=s.bufferViews.length-1;for(const P of u){const N=C.get(P);N.count!==0&&(N.accessorDef.sparse={count:N.count,indices:{bufferView:M,byteOffset:N.indicesByteOffset,componentType:I},values:{bufferView:k,byteOffset:N.valuesByteOffset}})}return{buffers:x,byteLength:T}}if(s.accessors=[],s.bufferViews=[],s.samplers=[],s.textures=[],s.images=r.listTextures().map((u,S)=>{const g=o.createPropertyDef(u);u.getMimeType()&&(g.mimeType=u.getMimeType());const x=u.getImage();return x&&o.createImageData(g,x,u),o.imageIndexMap.set(u,S),g}),h.filter(u=>u.prewriteTypes.includes(E.ACCESSOR)).forEach(u=>u.prewrite(o,E.ACCESSOR)),r.listAccessors().forEach(u=>{const S=o.accessorUsageGroupedByParent,g=o.accessorParents;if(o.accessorIndexMap.has(u))return;const x=o.getAccessorUsage(u);if(o.addAccessorToUsageGroup(u,x),S.has(x)){const T=a.listParents(u).find(C=>C.propertyType!==E.ROOT);g.set(u,T)}}),h.filter(u=>u.prewriteTypes.includes(E.BUFFER)).forEach(u=>u.prewrite(o,E.BUFFER)),(r.listAccessors().length>0||o.otherBufferViews.size>0||r.listTextures().length>0&&t.format===St.GLB)&&r.listBuffers().length===0)throw new Error("Buffer required for Document resources, but none was found.");s.buffers=[],r.listBuffers().forEach((u,S)=>{const g=o.createPropertyDef(u),x=o.accessorUsageGroupedByParent,T=u.listParents().filter(A=>A instanceof F),C=new Set(T.map(A=>o.accessorParents.get(A))),f=new Map(Array.from(C).map((A,k)=>[A,k])),w={};for(const A of T){var R;if(o.accessorIndexMap.has(A))continue;const k=o.getAccessorUsage(A);let P=k;if(x.has(k)){const N=o.accessorParents.get(A);P+=`:${f.get(N)}`}w[R=P]||(w[R]={usage:k,accessors:[]}),w[P].accessors.push(A)}const I=[],D=s.buffers.length;let M=0;for(const{usage:A,accessors:k}of Object.values(w))if(A===qn.ARRAY_BUFFER&&t.vertexLayout===Jt.INTERLEAVED){const P=b(k,D,M);M+=P.byteLength;for(const N of P.buffers)I.push(N)}else if(A===qn.ARRAY_BUFFER)for(const P of k){const N=b([P],D,M);M+=N.byteLength;for(const O of N.buffers)I.push(O)}else if(A===qn.SPARSE){const P=_(k,D,M);M+=P.byteLength;for(const N of P.buffers)I.push(N)}else if(A===qn.ELEMENT_ARRAY_BUFFER){const P=Ge.BufferViewTarget.ELEMENT_ARRAY_BUFFER,N=m(k,D,M,P);M+=N.byteLength;for(const O of N.buffers)I.push(O)}else{const P=m(k,D,M);M+=P.byteLength;for(const N of P.buffers)I.push(N)}if(o.imageBufferViews.length&&S===0){for(let A=0;A<o.imageBufferViews.length;A++)if(s.bufferViews[s.images[A].bufferView].byteOffset=M,M+=o.imageBufferViews[A].byteLength,I.push(o.imageBufferViews[A]),M%8){const k=8-M%8;M+=k,I.push(new Uint8Array(k))}}if(o.otherBufferViews.has(u))for(const A of o.otherBufferViews.get(u))s.bufferViews.push({buffer:D,byteOffset:M,byteLength:A.byteLength}),o.otherBufferViewsIndexMap.set(A,s.bufferViews.length-1),M+=A.byteLength,I.push(A);if(M){let A;t.format===St.GLB?A=qt:(A=o.bufferURIGenerator.createURI(u,"bin"),g.uri=A),g.byteLength=M,o.assignResourceURI(A,B.concat(I),!0)}s.buffers.push(g),o.bufferIndexMap.set(u,S)}),r.listAccessors().find(u=>!u.getBuffer())&&l.warn("Skipped writing one or more Accessors: no Buffer assigned."),h.filter(u=>u.prewriteTypes.includes(E.MATERIAL)).forEach(u=>u.prewrite(o,E.MATERIAL)),s.materials=r.listMaterials().map((u,S)=>{const g=o.createPropertyDef(u);if(u.getAlphaMode()!==Pt.AlphaMode.OPAQUE&&(g.alphaMode=u.getAlphaMode()),u.getAlphaMode()===Pt.AlphaMode.MASK&&(g.alphaCutoff=u.getAlphaCutoff()),u.getDoubleSided()&&(g.doubleSided=!0),g.pbrMetallicRoughness={},H.eq(u.getBaseColorFactor(),[1,1,1,1])||(g.pbrMetallicRoughness.baseColorFactor=u.getBaseColorFactor()),H.eq(u.getEmissiveFactor(),[0,0,0])||(g.emissiveFactor=u.getEmissiveFactor()),u.getRoughnessFactor()!==1&&(g.pbrMetallicRoughness.roughnessFactor=u.getRoughnessFactor()),u.getMetallicFactor()!==1&&(g.pbrMetallicRoughness.metallicFactor=u.getMetallicFactor()),u.getBaseColorTexture()){const x=u.getBaseColorTexture(),T=u.getBaseColorTextureInfo();g.pbrMetallicRoughness.baseColorTexture=o.createTextureInfoDef(x,T)}if(u.getEmissiveTexture()){const x=u.getEmissiveTexture(),T=u.getEmissiveTextureInfo();g.emissiveTexture=o.createTextureInfoDef(x,T)}if(u.getNormalTexture()){const x=u.getNormalTexture(),T=u.getNormalTextureInfo(),C=o.createTextureInfoDef(x,T);u.getNormalScale()!==1&&(C.scale=u.getNormalScale()),g.normalTexture=C}if(u.getOcclusionTexture()){const x=u.getOcclusionTexture(),T=u.getOcclusionTextureInfo(),C=o.createTextureInfoDef(x,T);u.getOcclusionStrength()!==1&&(C.strength=u.getOcclusionStrength()),g.occlusionTexture=C}if(u.getMetallicRoughnessTexture()){const x=u.getMetallicRoughnessTexture(),T=u.getMetallicRoughnessTextureInfo();g.pbrMetallicRoughness.metallicRoughnessTexture=o.createTextureInfoDef(x,T)}return o.materialIndexMap.set(u,S),g}),h.filter(u=>u.prewriteTypes.includes(E.MESH)).forEach(u=>u.prewrite(o,E.MESH)),s.meshes=r.listMeshes().map((u,S)=>{const g=o.createPropertyDef(u);let x=null;return g.primitives=u.listPrimitives().map(T=>{const C={attributes:{}};C.mode=T.getMode();const f=T.getMaterial();f&&(C.material=o.materialIndexMap.get(f)),Object.keys(T.getExtras()).length&&(C.extras=T.getExtras());const w=T.getIndices();w&&(C.indices=o.accessorIndexMap.get(w));for(const R of T.listSemantics())C.attributes[R]=o.accessorIndexMap.get(T.getAttribute(R));for(const R of T.listTargets()){const I={};for(const D of R.listSemantics())I[D]=o.accessorIndexMap.get(R.getAttribute(D));C.targets=C.targets||[],C.targets.push(I)}return T.listTargets().length&&!x&&(x=T.listTargets().map(R=>R.getName())),C}),u.getWeights().length&&(g.weights=u.getWeights()),x&&(g.extras=g.extras||{},g.extras.targetNames=x),o.meshIndexMap.set(u,S),g}),s.cameras=r.listCameras().map((u,S)=>{const g=o.createPropertyDef(u);if(g.type=u.getType(),g.type===Nt.Type.PERSPECTIVE){g.perspective={znear:u.getZNear(),zfar:u.getZFar(),yfov:u.getYFov()};const x=u.getAspectRatio();x!==null&&(g.perspective.aspectRatio=x)}else g.orthographic={znear:u.getZNear(),zfar:u.getZFar(),xmag:u.getXMag(),ymag:u.getYMag()};return o.cameraIndexMap.set(u,S),g}),s.nodes=r.listNodes().map((u,S)=>{const g=o.createPropertyDef(u);return H.eq(u.getTranslation(),[0,0,0])||(g.translation=u.getTranslation()),H.eq(u.getRotation(),[0,0,0,1])||(g.rotation=u.getRotation()),H.eq(u.getScale(),[1,1,1])||(g.scale=u.getScale()),u.getWeights().length&&(g.weights=u.getWeights()),o.nodeIndexMap.set(u,S),g}),s.skins=r.listSkins().map((u,S)=>{const g=o.createPropertyDef(u),x=u.getInverseBindMatrices();x&&(g.inverseBindMatrices=o.accessorIndexMap.get(x));const T=u.getSkeleton();return T&&(g.skeleton=o.nodeIndexMap.get(T)),g.joints=u.listJoints().map(C=>o.nodeIndexMap.get(C)),o.skinIndexMap.set(u,S),g}),r.listNodes().forEach((u,S)=>{const g=s.nodes[S],x=u.getMesh();x&&(g.mesh=o.meshIndexMap.get(x));const T=u.getCamera();T&&(g.camera=o.cameraIndexMap.get(T));const C=u.getSkin();C&&(g.skin=o.skinIndexMap.get(C)),u.listChildren().length>0&&(g.children=u.listChildren().map(f=>o.nodeIndexMap.get(f)))}),s.animations=r.listAnimations().map((u,S)=>{const g=o.createPropertyDef(u),x=new Map;return g.samplers=u.listSamplers().map((T,C)=>{const f=o.createPropertyDef(T);return f.input=o.accessorIndexMap.get(T.getInput()),f.output=o.accessorIndexMap.get(T.getOutput()),f.interpolation=T.getInterpolation(),x.set(T,C),f}),g.channels=u.listChannels().map(T=>{const C=o.createPropertyDef(T);return C.sampler=x.get(T.getSampler()),C.target={node:o.nodeIndexMap.get(T.getTargetNode()),path:T.getTargetPath()},C}),o.animationIndexMap.set(u,S),g}),s.scenes=r.listScenes().map((u,S)=>{const g=o.createPropertyDef(u);return g.nodes=u.listChildren().map(x=>o.nodeIndexMap.get(x)),o.sceneIndexMap.set(u,S),g});const v=r.getDefaultScene();return v&&(s.scene=r.listScenes().indexOf(v)),s.extensionsUsed=h.map(u=>u.extensionName),s.extensionsRequired=d.map(u=>u.extensionName),h.forEach(u=>u.write(o)),Df(s),i}}function Df(n){const e=[];for(const t in n){const a=n[t];(Array.isArray(a)&&a.length===0||a===null||a===""||a&&typeof a=="object"&&Object.keys(a).length===0)&&e.push(t)}for(const t of e)delete n[t]}var ia;(function(n){n[n.JSON=1313821514]="JSON",n[n.BIN=5130562]="BIN"})(ia||(ia={}));class Mf{constructor(){this._logger=Me.DEFAULT_INSTANCE,this._extensions=new Set,this._dependencies={},this._vertexLayout=Jt.INTERLEAVED,this._strictResources=!0,this.lastReadBytes=0,this.lastWriteBytes=0}setLogger(e){return this._logger=e,this}registerExtensions(e){for(const t of e)this._extensions.add(t),t.register();return this}registerDependencies(e){return Object.assign(this._dependencies,e),this}setVertexLayout(e){return this._vertexLayout=e,this}setStrictResources(e){return this._strictResources=e,this}async read(e){return await this.readJSON(await this.readAsJSON(e))}async readAsJSON(e){const t=await this.readURI(e,"view");this.lastReadBytes=t.byteLength;const a=Js(t)?this._binaryToJSON(t):{json:JSON.parse(B.decodeText(t)),resources:{}};return await this._readResourcesExternal(a,this.dirname(e)),this._readResourcesInternal(a),a}async readJSON(e){return e=this._copyJSON(e),this._readResourcesInternal(e),Sf.read(e,{extensions:Array.from(this._extensions),dependencies:this._dependencies,logger:this._logger})}async binaryToJSON(e){const t=this._binaryToJSON(B.assertView(e));this._readResourcesInternal(t);const a=t.json;if(a.buffers&&a.buffers.some(r=>Pf(t,r)))throw new Error("Cannot resolve external buffers with binaryToJSON().");if(a.images&&a.images.some(r=>Ff(t,r)))throw new Error("Cannot resolve external images with binaryToJSON().");return t}async readBinary(e){return this.readJSON(await this.binaryToJSON(B.assertView(e)))}async writeJSON(e,t={}){if(t.format===St.GLB&&e.getRoot().listBuffers().length>1)throw new Error("GLB must have 0–1 buffers.");return Af.write(e,{format:t.format||St.GLTF,basename:t.basename||"",logger:this._logger,vertexLayout:this._vertexLayout,dependencies:fe({},this._dependencies),extensions:Array.from(this._extensions)})}async writeBinary(e){const{json:t,resources:a}=await this.writeJSON(e,{format:St.GLB}),r=new Uint32Array([1179937895,2,12]),s=JSON.stringify(t),i=B.pad(B.encodeText(s),32),o=B.toView(new Uint32Array([i.byteLength,1313821514])),l=B.concat([o,i]);r[r.length-1]+=l.byteLength;const c=Object.values(a)[0];if(!c||!c.byteLength)return B.concat([B.toView(r),l]);const h=B.pad(c,0),d=B.toView(new Uint32Array([h.byteLength,5130562])),m=B.concat([d,h]);return r[r.length-1]+=m.byteLength,B.concat([B.toView(r),l,m])}async _readResourcesExternal(e,t){var a=this;const r=e.json.images||[],s=e.json.buffers||[],i=[...r,...s].map(async function(o){const l=o.uri;if(!l||l.match(/data:/))return Promise.resolve();try{e.resources[l]=await a.readURI(a.resolve(t,l),"view"),a.lastReadBytes+=e.resources[l].byteLength}catch(c){if(!a._strictResources&&r.includes(o))a._logger.warn(`Failed to load image URI, "${l}". ${c}`),e.resources[l]=null;else throw c}});await Promise.all(i)}_readResourcesInternal(e){function t(s){if(s.uri){if(s.uri in e.resources){B.assertView(e.resources[s.uri]);return}if(s.uri.match(/data:/)){const i=`__${ff()}.${Yt.extension(s.uri)}`;e.resources[i]=B.createBufferFromDataURI(s.uri),s.uri=i}}}(e.json.images||[]).forEach(s=>{if(s.bufferView===void 0&&s.uri===void 0)throw new Error("Missing resource URI or buffer view.");t(s)}),(e.json.buffers||[]).forEach(t)}_copyJSON(e){const{images:t,buffers:a}=e.json;return e={json:fe({},e.json),resources:fe({},e.resources)},t&&(e.json.images=t.map(r=>fe({},r))),a&&(e.json.buffers=a.map(r=>fe({},r))),e}_binaryToJSON(e){if(!Js(e))throw new Error("Invalid glTF 2.0 binary.");const t=new Uint32Array(e.buffer,e.byteOffset+12,2);if(t[1]!==ia.JSON)throw new Error("Missing required GLB JSON chunk.");const a=20,r=t[0],s=B.decodeText(B.toView(e,a,r)),i=JSON.parse(s),o=a+r;if(e.byteLength<=o)return{json:i,resources:{}};const l=new Uint32Array(e.buffer,e.byteOffset+o,2);if(l[1]!==ia.BIN)return{json:i,resources:{}};const c=l[0],h=B.toView(e,o+8,c);return{json:i,resources:{[qt]:h}}}}function Pf(n,e){return e.uri!==void 0&&!(e.uri in n.resources)}function Ff(n,e){return e.uri!==void 0&&!(e.uri in n.resources)&&e.bufferView===void 0}function Js(n){if(n.byteLength<3*Uint32Array.BYTES_PER_ELEMENT)return!1;const e=new Uint32Array(n.buffer,n.byteOffset,3);return e[0]===1179937895&&e[1]===2}class kf extends Mf{constructor(e=mn.DEFAULT_INIT){super(),this._fetchConfig=void 0,this._fetchConfig=e}async readURI(e,t){const a=await fetch(e,this._fetchConfig);switch(t){case"view":return new Uint8Array(await a.arrayBuffer());case"text":return a.text()}}resolve(e,t){return mn.resolve(e,t)}dirname(e){return mn.dirname(e)}}const Nf=0,jf=0,Bf=0,Of=2,Vf=0,Lf=163,Uf=166,Gf=0,Wf=2,zf=1,Hf=64,Xf=0;function Kf(){return{vkFormat:Xf,typeSize:1,pixelWidth:0,pixelHeight:0,pixelDepth:0,layerCount:0,faceCount:1,levelCount:0,supercompressionScheme:Nf,levels:[],dataFormatDescriptor:[{vendorId:Bf,descriptorType:jf,versionNumber:Of,colorModel:Vf,colorPrimaries:zf,transferFunction:Wf,flags:Gf,texelBlockDimension:[0,0,0,0],bytesPlane:[0,0,0,0,0,0,0,0],samples:[]}],keyValue:{},globalData:null}}class hn{constructor(e,t,a,r){this._dataView=void 0,this._littleEndian=void 0,this._offset=void 0,this._dataView=new DataView(e.buffer,e.byteOffset+t,a),this._littleEndian=r,this._offset=0}_nextUint8(){const e=this._dataView.getUint8(this._offset);return this._offset+=1,e}_nextUint16(){const e=this._dataView.getUint16(this._offset,this._littleEndian);return this._offset+=2,e}_nextUint32(){const e=this._dataView.getUint32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint64(){const e=this._dataView.getUint32(this._offset,this._littleEndian),t=this._dataView.getUint32(this._offset+4,this._littleEndian),a=e+2**32*t;return this._offset+=8,a}_nextInt32(){const e=this._dataView.getInt32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint8Array(e){const t=new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+this._offset,e);return this._offset+=e,t}_skip(e){return this._offset+=e,this}_scan(e,t=0){const a=this._offset;let r=0;for(;this._dataView.getUint8(this._offset)!==t&&r<e;)r++,this._offset++;return r<e&&this._offset++,new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+a,r)}}const he=[171,75,84,88,32,50,48,187,13,10,26,10];function Ys(n){return new TextDecoder().decode(n)}function Ma(n){const e=new Uint8Array(n.buffer,n.byteOffset,he.length);if(e[0]!==he[0]||e[1]!==he[1]||e[2]!==he[2]||e[3]!==he[3]||e[4]!==he[4]||e[5]!==he[5]||e[6]!==he[6]||e[7]!==he[7]||e[8]!==he[8]||e[9]!==he[9]||e[10]!==he[10]||e[11]!==he[11])throw new Error("Missing KTX 2.0 identifier.");const t=Kf(),a=17*Uint32Array.BYTES_PER_ELEMENT,r=new hn(n,he.length,a,!0);t.vkFormat=r._nextUint32(),t.typeSize=r._nextUint32(),t.pixelWidth=r._nextUint32(),t.pixelHeight=r._nextUint32(),t.pixelDepth=r._nextUint32(),t.layerCount=r._nextUint32(),t.faceCount=r._nextUint32(),t.levelCount=r._nextUint32(),t.supercompressionScheme=r._nextUint32();const s=r._nextUint32(),i=r._nextUint32(),o=r._nextUint32(),l=r._nextUint32(),c=r._nextUint64(),h=r._nextUint64(),d=Math.max(t.levelCount,1)*3*8,m=new hn(n,he.length+a,d,!0);for(let ie=0,ue=Math.max(t.levelCount,1);ie<ue;ie++)t.levels.push({levelData:new Uint8Array(n.buffer,n.byteOffset+m._nextUint64(),m._nextUint64()),uncompressedByteLength:m._nextUint64()});const b=new hn(n,s,i,!0);b._skip(4);const _=b._nextUint16(),p=b._nextUint16(),v=b._nextUint16(),u=b._nextUint16(),S=b._nextUint8(),g=b._nextUint8(),x=b._nextUint8(),T=b._nextUint8(),C=[b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8()],f=[b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8()],R={vendorId:_,descriptorType:p,versionNumber:v,colorModel:S,colorPrimaries:g,transferFunction:x,flags:T,texelBlockDimension:C,bytesPlane:f,samples:[]},M=(u/4-6)/4;for(let ie=0;ie<M;ie++){const ue={bitOffset:b._nextUint16(),bitLength:b._nextUint8(),channelType:b._nextUint8(),samplePosition:[b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8()],sampleLower:Number.NEGATIVE_INFINITY,sampleUpper:Number.POSITIVE_INFINITY};ue.channelType&Hf?(ue.sampleLower=b._nextInt32(),ue.sampleUpper=b._nextInt32()):(ue.sampleLower=b._nextUint32(),ue.sampleUpper=b._nextUint32()),R.samples[ie]=ue}t.dataFormatDescriptor.length=0,t.dataFormatDescriptor.push(R);const A=new hn(n,o,l,!0);for(;A._offset<l;){const ie=A._nextUint32(),ue=A._scan(ie),yt=Ys(ue);if(t.keyValue[yt]=A._nextUint8Array(ie-ue.byteLength-1),yt.match(/^ktx/i)){const an=Ys(t.keyValue[yt]);t.keyValue[yt]=an.substring(0,an.lastIndexOf("\0"))}const Gn=ie%4?4-ie%4:0;A._skip(Gn)}if(h<=0)return t;const k=new hn(n,c,h,!0),P=k._nextUint16(),N=k._nextUint16(),O=k._nextUint32(),j=k._nextUint32(),L=k._nextUint32(),Se=k._nextUint32(),le=[];for(let ie=0,ue=Math.max(t.levelCount,1);ie<ue;ie++)le.push({imageFlags:k._nextUint32(),rgbSliceByteOffset:k._nextUint32(),rgbSliceByteLength:k._nextUint32(),alphaSliceByteOffset:k._nextUint32(),alphaSliceByteLength:k._nextUint32()});const ce=c+k._offset,Fe=ce+O,de=Fe+j,je=de+L,Be=new Uint8Array(n.buffer,n.byteOffset+ce,O),Vn=new Uint8Array(n.buffer,n.byteOffset+Fe,j),Ln=new Uint8Array(n.buffer,n.byteOffset+de,L),Un=new Uint8Array(n.buffer,n.byteOffset+je,Se);return t.globalData={endpointCount:P,selectorCount:N,imageDescs:le,endpointsData:Be,selectorsData:Vn,tablesData:Ln,extendedData:Un},t}const Xe="EXT_mesh_gpu_instancing",oe="EXT_meshopt_compression",fn="EXT_texture_webp",pn="EXT_texture_avif",$="KHR_draco_mesh_compression",Ie="KHR_lights_punctual",Ke="KHR_materials_anisotropy",qe="KHR_materials_clearcoat",Je="KHR_materials_diffuse_transmission",Ye="KHR_materials_dispersion",$e="KHR_materials_emissive_strength",Qe="KHR_materials_ior",Ze="KHR_materials_iridescence",et="KHR_materials_pbrSpecularGlossiness",tt="KHR_materials_sheen",nt="KHR_materials_specular",at="KHR_materials_transmission",mt="KHR_materials_unlit",rt="KHR_materials_volume",_e="KHR_materials_variants",Lo="KHR_mesh_quantization",st="KHR_node_visibility",bn="KHR_texture_basisu",it="KHR_texture_transform",Re="KHR_xmp_json_ld",Ha="INSTANCE_ATTRIBUTE";class Uo extends Z{init(){this.extensionName=Xe,this.propertyType="InstancedMesh",this.parentTypes=[E.NODE]}getDefaults(){return Object.assign(super.getDefaults(),{attributes:new ke})}getAttribute(e){return this.getRefMap("attributes",e)}setAttribute(e,t){return this.setRefMap("attributes",e,t,{usage:Ha})}listAttributes(){return this.listRefMapValues("attributes")}listSemantics(){return this.listRefMapKeys("attributes")}}Uo.EXTENSION_NAME=Xe;class Go extends J{constructor(...e){super(...e),this.extensionName=Xe,this.provideTypes=[E.NODE],this.prewriteTypes=[E.ACCESSOR]}createInstancedMesh(){return new Uo(this.document.getGraph())}read(e){return(e.jsonDoc.json.nodes||[]).forEach((r,s)=>{if(!r.extensions||!r.extensions[Xe])return;const i=r.extensions[Xe],o=this.createInstancedMesh();for(const l in i.attributes)o.setAttribute(l,e.accessors[i.attributes[l]]);e.nodes[s].setExtension(Xe,o)}),this}prewrite(e){e.accessorUsageGroupedByParent.add(Ha);for(const t of this.properties)for(const a of t.listAttributes())e.addAccessorToUsageGroup(a,Ha);return this}write(e){const t=e.jsonDoc;return this.document.getRoot().listNodes().forEach(a=>{const r=a.getExtension(Xe);if(r){const s=e.nodeIndexMap.get(a),i=t.json.nodes[s],o={attributes:{}};r.listSemantics().forEach(l=>{const c=r.getAttribute(l);o.attributes[l]=e.accessorIndexMap.get(c)}),i.extensions=i.extensions||{},i.extensions[Xe]=o}}),this}}Go.EXTENSION_NAME=Xe;function ct(){return ct=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var a in t)({}).hasOwnProperty.call(t,a)&&(n[a]=t[a])}return n},ct.apply(null,arguments)}var In;(function(n){n.QUANTIZE="quantize",n.FILTER="filter"})(In||(In={}));var Xt;(function(n){n.ATTRIBUTES="ATTRIBUTES",n.TRIANGLES="TRIANGLES",n.INDICES="INDICES"})(Xt||(Xt={}));var ee;(function(n){n.NONE="NONE",n.OCTAHEDRAL="OCTAHEDRAL",n.QUATERNION="QUATERNION",n.EXPONENTIAL="EXPONENTIAL"})(ee||(ee={}));function qf(n){return!n.extensions||!n.extensions[oe]?!1:!!n.extensions[oe].fallback}const{BYTE:Jf,SHORT:$s,FLOAT:Yf}=F.ComponentType,{encodeNormalizedInt:Qs,decodeNormalizedInt:Xa}=H;function $f(n,e,t,a){const{filter:r,bits:s}=a,i={array:n.getArray(),byteStride:n.getElementSize()*n.getComponentSize(),componentType:n.getComponentType(),normalized:n.getNormalized()};if(t!==Xt.ATTRIBUTES)return i;if(r!==ee.NONE){let o=n.getNormalized()?Qf(n):new Float32Array(i.array);switch(r){case ee.EXPONENTIAL:i.byteStride=n.getElementSize()*4,i.componentType=Yf,i.normalized=!1,i.array=e.encodeFilterExp(o,n.getCount(),i.byteStride,s);break;case ee.OCTAHEDRAL:i.byteStride=s>8?8:4,i.componentType=s>8?$s:Jf,i.normalized=!0,o=n.getElementSize()===3?ep(o):o,i.array=e.encodeFilterOct(o,n.getCount(),i.byteStride,s);break;case ee.QUATERNION:i.byteStride=8,i.componentType=$s,i.normalized=!0,i.array=e.encodeFilterQuat(o,n.getCount(),i.byteStride,s);break;default:throw new Error("Invalid filter.")}i.min=n.getMin([]),i.max=n.getMax([]),n.getNormalized()&&(i.min=i.min.map(l=>Xa(l,n.getComponentType())),i.max=i.max.map(l=>Xa(l,n.getComponentType()))),i.normalized&&(i.min=i.min.map(l=>Qs(l,i.componentType)),i.max=i.max.map(l=>Qs(l,i.componentType)))}else i.byteStride%4&&(i.array=Zf(i.array,n.getElementSize()),i.byteStride=i.array.byteLength/n.getCount());return i}function Qf(n){const e=n.getComponentType(),t=n.getArray(),a=new Float32Array(t.length);for(let r=0;r<t.length;r++)a[r]=Xa(t[r],e);return a}function Zf(n,e){const a=B.padNumber(n.BYTES_PER_ELEMENT*e)/n.BYTES_PER_ELEMENT,r=n.length/e,s=new n.constructor(r*a);for(let i=0;i*e<n.length;i++)for(let o=0;o<e;o++)s[i*a+o]=n[i*e+o];return s}function ep(n){const e=new Float32Array(n.length*4/3);for(let t=0,a=n.length/3;t<a;t++)e[t*4]=n[t*3],e[t*4+1]=n[t*3+1],e[t*4+2]=n[t*3+2];return e}function tp(n,e){return e===Ge.BufferViewUsage.ELEMENT_ARRAY_BUFFER?n.listParents().some(a=>a instanceof Ne&&a.getMode()===Ne.Mode.TRIANGLES)?Xt.TRIANGLES:Xt.INDICES:Xt.ATTRIBUTES}function np(n,e){const t=e.getGraph().listParentEdges(n).filter(a=>!(a.getParent()instanceof Vo));for(const a of t){const r=a.getName(),s=a.getAttributes().key||"",i=a.getParent().propertyType===E.PRIMITIVE_TARGET;if(r==="indices")return{filter:ee.NONE};if(r==="attributes"){if(s==="POSITION")return{filter:ee.NONE};if(s==="TEXCOORD_0")return{filter:ee.NONE};if(s.startsWith("JOINTS_"))return{filter:ee.NONE};if(s.startsWith("WEIGHTS_"))return{filter:ee.NONE};if(s==="NORMAL"||s==="TANGENT")return i?{filter:ee.NONE}:{filter:ee.OCTAHEDRAL,bits:8}}if(r==="output"){const o=Wo(n);return o==="rotation"?{filter:ee.QUATERNION,bits:16}:o==="translation"?{filter:ee.EXPONENTIAL,bits:12}:o==="scale"?{filter:ee.EXPONENTIAL,bits:12}:{filter:ee.NONE}}if(r==="input")return{filter:ee.NONE};if(r==="inverseBindMatrices")return{filter:ee.NONE}}return{filter:ee.NONE}}function Wo(n){for(const e of n.listParents())if(e instanceof nn){for(const t of e.listParents())if(t instanceof ga)return t.getTargetPath()}return null}const Zs={method:In.QUANTIZE};class wr extends J{constructor(...e){super(...e),this.extensionName=oe,this.prereadTypes=[E.BUFFER,E.PRIMITIVE],this.prewriteTypes=[E.BUFFER,E.ACCESSOR],this.readDependencies=["meshopt.decoder"],this.writeDependencies=["meshopt.encoder"],this._decoder=null,this._decoderFallbackBufferMap=new Map,this._encoder=null,this._encoderOptions=Zs,this._encoderFallbackBuffer=null,this._encoderBufferViews={},this._encoderBufferViewData={},this._encoderBufferViewAccessors={}}install(e,t){return e==="meshopt.decoder"&&(this._decoder=t),e==="meshopt.encoder"&&(this._encoder=t),this}setEncoderOptions(e){return this._encoderOptions=ct({},Zs,e),this}preread(e,t){if(!this._decoder){if(!this.isRequired())return this;throw new Error(`[${oe}] Please install extension dependency, "meshopt.decoder".`)}if(!this._decoder.supported){if(!this.isRequired())return this;throw new Error(`[${oe}]: Missing WASM support.`)}return t===E.BUFFER?this._prereadBuffers(e):t===E.PRIMITIVE&&this._prereadPrimitives(e),this}_prereadBuffers(e){const t=e.jsonDoc;(t.json.bufferViews||[]).forEach((r,s)=>{if(!r.extensions||!r.extensions[oe])return;const i=r.extensions[oe],o=i.byteOffset||0,l=i.byteLength||0,c=i.count,h=i.byteStride,d=new Uint8Array(c*h),m=t.json.buffers[i.buffer],b=m.uri?t.resources[m.uri]:t.resources[qt],_=B.toView(b,o,l);this._decoder.decodeGltfBuffer(d,c,h,_,i.mode,i.filter),e.bufferViews[s]=d})}_prereadPrimitives(e){const t=e.jsonDoc;(t.json.bufferViews||[]).forEach(r=>{if(!r.extensions||!r.extensions[oe])return;const s=r.extensions[oe],i=e.buffers[s.buffer],o=e.buffers[r.buffer],l=t.json.buffers[r.buffer];qf(l)&&this._decoderFallbackBufferMap.set(o,i)})}read(e){if(!this.isRequired())return this;for(const[t,a]of this._decoderFallbackBufferMap){for(const r of t.listParents())r instanceof F&&r.swap(t,a);t.dispose()}return this}prewrite(e,t){return t===E.ACCESSOR?this._prewriteAccessors(e):t===E.BUFFER&&this._prewriteBuffers(e),this}_prewriteAccessors(e){const t=e.jsonDoc.json,a=this._encoder,r=this._encoderOptions,s=this.document.getGraph(),i=this.document.createBuffer(),o=this.document.getRoot().listBuffers().indexOf(i);let l=1;const c=new Map,h=d=>{for(const m of s.listParents(d)){if(m.propertyType===E.ROOT)continue;let b=c.get(d);return b===void 0&&c.set(d,b=l++),b}return-1};this._encoderFallbackBuffer=i,this._encoderBufferViews={},this._encoderBufferViewData={},this._encoderBufferViewAccessors={};for(const d of this.document.getRoot().listAccessors()){if(Wo(d)==="weights"||d.getSparse())continue;const m=e.getAccessorUsage(d),b=e.accessorUsageGroupedByParent.has(m)?h(d):null,_=tp(d,m),p=r.method===In.FILTER?np(d,this.document):{filter:ee.NONE},v=$f(d,a,_,p),{array:u,byteStride:S}=v,g=d.getBuffer();if(!g)throw new Error(`${oe}: Missing buffer for accessor.`);const x=this.document.getRoot().listBuffers().indexOf(g),T=[m,b,_,p.filter,S,x].join(":");let C=this._encoderBufferViews[T],f=this._encoderBufferViewData[T],w=this._encoderBufferViewAccessors[T];(!C||!f)&&(w=this._encoderBufferViewAccessors[T]=[],f=this._encoderBufferViewData[T]=[],C=this._encoderBufferViews[T]={buffer:o,target:Ge.USAGE_TO_TARGET[m],byteOffset:0,byteLength:0,byteStride:m===Ge.BufferViewUsage.ARRAY_BUFFER?S:void 0,extensions:{[oe]:{buffer:x,byteOffset:0,byteLength:0,mode:_,filter:p.filter!==ee.NONE?p.filter:void 0,byteStride:S,count:0}}});const R=e.createAccessorDef(d);R.componentType=v.componentType,R.normalized=v.normalized,R.byteOffset=C.byteLength,R.min&&v.min&&(R.min=v.min),R.max&&v.max&&(R.max=v.max),e.accessorIndexMap.set(d,t.accessors.length),t.accessors.push(R),w.push(R),f.push(new Uint8Array(u.buffer,u.byteOffset,u.byteLength)),C.byteLength+=u.byteLength,C.extensions.EXT_meshopt_compression.count+=d.getCount()}}_prewriteBuffers(e){const t=this._encoder;for(const a in this._encoderBufferViews){const r=this._encoderBufferViews[a],s=this._encoderBufferViewData[a],i=this.document.getRoot().listBuffers()[r.extensions[oe].buffer],o=e.otherBufferViews.get(i)||[],{count:l,byteStride:c,mode:h}=r.extensions[oe],d=B.concat(s),m=t.encodeGltfBuffer(d,l,c,h),b=B.pad(m);r.extensions[oe].byteLength=m.byteLength,s.length=0,s.push(b),o.push(b),e.otherBufferViews.set(i,o)}}write(e){let t=0;for(const i in this._encoderBufferViews){const o=this._encoderBufferViews[i],l=this._encoderBufferViewData[i][0],c=e.otherBufferViewsIndexMap.get(l),h=this._encoderBufferViewAccessors[i];for(const _ of h)_.bufferView=c;const d=e.jsonDoc.json.bufferViews[c],m=d.byteOffset||0;Object.assign(d,o),d.byteOffset=t;const b=d.extensions[oe];b.byteOffset=m,t+=B.padNumber(o.byteLength)}const a=this._encoderFallbackBuffer,r=e.bufferIndexMap.get(a),s=e.jsonDoc.json.buffers[r];return s.byteLength=t,s.extensions={[oe]:{fallback:!0}},a.dispose(),this}}wr.EXTENSION_NAME=oe;wr.EncoderMethod=In;class ap{match(e){return e.length>=12&&B.decodeText(e.slice(4,12))==="ftypavif"}getSize(e){if(!this.match(e))return null;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);let a=ei(t,0);if(!a)return null;let r=a.end;for(;a=ei(t,r);)if(a.type==="meta")r=a.start+4;else if(a.type==="iprp"||a.type==="ipco")r=a.start;else{if(a.type==="ispe")return[t.getUint32(a.start+4),t.getUint32(a.start+8)];if(a.type==="mdat")break;r=a.end}return null}getChannels(e){return 4}}class zo extends J{constructor(...e){super(...e),this.extensionName=pn,this.prereadTypes=[E.TEXTURE]}static register(){Ue.registerFormat("image/avif",new ap)}preread(e){return(e.jsonDoc.json.textures||[]).forEach(a=>{a.extensions&&a.extensions[pn]&&(a.source=a.extensions[pn].source)}),this}read(e){return this}write(e){const t=e.jsonDoc;return this.document.getRoot().listTextures().forEach(a=>{if(a.getMimeType()==="image/avif"){const r=e.imageIndexMap.get(a);(t.json.textures||[]).forEach(i=>{i.source===r&&(i.extensions=i.extensions||{},i.extensions[pn]={source:i.source},delete i.source)})}}),this}}zo.EXTENSION_NAME=pn;function ei(n,e){if(n.byteLength<4+e)return null;const t=n.getUint32(e);return n.byteLength<t+e||t<8?null:{type:B.decodeText(new Uint8Array(n.buffer,n.byteOffset+e+4,4)),start:e+8,end:e+t}}class rp{match(e){return e.length>=12&&e[8]===87&&e[9]===69&&e[10]===66&&e[11]===80}getSize(e){const t=B.decodeText(e.slice(0,4)),a=B.decodeText(e.slice(8,12));if(t!=="RIFF"||a!=="WEBP")return null;const r=new DataView(e.buffer,e.byteOffset);let s=12;for(;s<r.byteLength;){const i=B.decodeText(new Uint8Array([r.getUint8(s),r.getUint8(s+1),r.getUint8(s+2),r.getUint8(s+3)])),o=r.getUint32(s+4,!0);if(i==="VP8 "){const l=r.getInt16(s+14,!0)&16383,c=r.getInt16(s+16,!0)&16383;return[l,c]}else if(i==="VP8L"){const l=r.getUint8(s+9),c=r.getUint8(s+10),h=r.getUint8(s+11),d=r.getUint8(s+12),m=1+((c&63)<<8|l),b=1+((d&15)<<10|h<<2|(c&192)>>6);return[m,b]}s+=8+o+o%2}return null}getChannels(e){return 4}}class Ho extends J{constructor(...e){super(...e),this.extensionName=fn,this.prereadTypes=[E.TEXTURE]}static register(){Ue.registerFormat("image/webp",new rp)}preread(e){return(e.jsonDoc.json.textures||[]).forEach(a=>{a.extensions&&a.extensions[fn]&&(a.source=a.extensions[fn].source)}),this}read(e){return this}write(e){const t=e.jsonDoc;return this.document.getRoot().listTextures().forEach(a=>{if(a.getMimeType()==="image/webp"){const r=e.imageIndexMap.get(a);(t.json.textures||[]).forEach(i=>{i.source===r&&(i.extensions=i.extensions||{},i.extensions[fn]={source:i.source},delete i.source)})}}),this}}Ho.EXTENSION_NAME=fn;let re,Xo,Ko;function sp(n,e){const t=new re.DecoderBuffer;try{if(t.Init(e,e.length),n.GetEncodedGeometryType(t)!==re.TRIANGULAR_MESH)throw new Error(`[${$}] Unknown geometry type.`);const r=new re.Mesh;if(!n.DecodeBufferToMesh(t,r).ok()||r.ptr===0)throw new Error(`[${$}] Decoding failure.`);return r}finally{re.destroy(t)}}function ip(n,e){const a=e.num_faces()*3;let r,s;if(e.num_points()<=65534){const i=a*Uint16Array.BYTES_PER_ELEMENT;r=re._malloc(i),n.GetTrianglesUInt16Array(e,i,r),s=new Uint16Array(re.HEAPU16.buffer,r,a).slice()}else{const i=a*Uint32Array.BYTES_PER_ELEMENT;r=re._malloc(i),n.GetTrianglesUInt32Array(e,i,r),s=new Uint32Array(re.HEAPU32.buffer,r,a).slice()}return re._free(r),s}function op(n,e,t,a){const r=Ko[a.componentType],s=Xo[a.componentType],i=t.num_components(),l=e.num_points()*i,c=l*s.BYTES_PER_ELEMENT,h=re._malloc(c);n.GetAttributeDataArrayForAllPoints(e,t,r,c,h);const d=new s(re.HEAPF32.buffer,h,l).slice();return re._free(h),d}function lp(n){re=n,Xo={[F.ComponentType.FLOAT]:Float32Array,[F.ComponentType.UNSIGNED_INT]:Uint32Array,[F.ComponentType.UNSIGNED_SHORT]:Uint16Array,[F.ComponentType.UNSIGNED_BYTE]:Uint8Array,[F.ComponentType.SHORT]:Int16Array,[F.ComponentType.BYTE]:Int8Array},Ko={[F.ComponentType.FLOAT]:re.DT_FLOAT32,[F.ComponentType.UNSIGNED_INT]:re.DT_UINT32,[F.ComponentType.UNSIGNED_SHORT]:re.DT_UINT16,[F.ComponentType.UNSIGNED_BYTE]:re.DT_UINT8,[F.ComponentType.SHORT]:re.DT_INT16,[F.ComponentType.BYTE]:re.DT_INT8}}let Ce;var Rn;(function(n){n[n.EDGEBREAKER=1]="EDGEBREAKER",n[n.SEQUENTIAL=0]="SEQUENTIAL"})(Rn||(Rn={}));var Ae;(function(n){n.POSITION="POSITION",n.NORMAL="NORMAL",n.COLOR="COLOR",n.TEX_COORD="TEX_COORD",n.GENERIC="GENERIC"})(Ae||(Ae={}));const qo={[Ae.POSITION]:14,[Ae.NORMAL]:10,[Ae.COLOR]:8,[Ae.TEX_COORD]:12,[Ae.GENERIC]:12},ti={decodeSpeed:5,encodeSpeed:5,method:Rn.EDGEBREAKER,quantizationBits:qo,quantizationVolume:"mesh"};function cp(n){Ce=n}function up(n,e=ti){const t=ct({},ti,e);t.quantizationBits=ct({},qo,e.quantizationBits);const a=new Ce.MeshBuilder,r=new Ce.Mesh,s=new Ce.ExpertEncoder(r),i={},o=new Ce.DracoInt8Array,l=n.listTargets().length>0;let c=!1;for(const p of n.listSemantics()){const v=n.getAttribute(p);if(v.getSparse()){c=!0;continue}const u=_p(p),S=dp(a,v.getComponentType(),r,Ce[u],v.getCount(),v.getElementSize(),v.getArray());if(S===-1)throw new Error(`Error compressing "${p}" attribute.`);if(i[p]=S,t.quantizationVolume==="mesh"||p!=="POSITION")s.SetAttributeQuantization(S,t.quantizationBits[u]);else if(typeof t.quantizationVolume=="object"){const{quantizationVolume:g}=t,x=Math.max(g.max[0]-g.min[0],g.max[1]-g.min[1],g.max[2]-g.min[2]);s.SetAttributeExplicitQuantization(S,t.quantizationBits[u],v.getElementSize(),g.min,x)}else throw new Error("Invalid quantization volume state.")}const h=n.getIndices();if(!h)throw new Ka("Primitive must have indices.");a.AddFacesToMesh(r,h.getCount()/3,h.getArray()),s.SetSpeedOptions(t.encodeSpeed,t.decodeSpeed),s.SetTrackEncodedProperties(!0),t.method===Rn.SEQUENTIAL||l||c?s.SetEncodingMethod(Ce.MESH_SEQUENTIAL_ENCODING):s.SetEncodingMethod(Ce.MESH_EDGEBREAKER_ENCODING);const d=s.EncodeToDracoBuffer(!(l||c),o);if(d<=0)throw new Ka("Error applying Draco compression.");const m=new Uint8Array(d);for(let p=0;p<d;++p)m[p]=o.GetValue(p);const b=s.GetNumberOfEncodedPoints(),_=s.GetNumberOfEncodedFaces()*3;return Ce.destroy(o),Ce.destroy(r),Ce.destroy(a),Ce.destroy(s),{numVertices:b,numIndices:_,data:m,attributeIDs:i}}function _p(n){return n==="POSITION"?Ae.POSITION:n==="NORMAL"?Ae.NORMAL:n.startsWith("COLOR_")?Ae.COLOR:n.startsWith("TEXCOORD_")?Ae.TEX_COORD:Ae.GENERIC}function dp(n,e,t,a,r,s,i){switch(e){case F.ComponentType.UNSIGNED_BYTE:return n.AddUInt8Attribute(t,a,r,s,i);case F.ComponentType.BYTE:return n.AddInt8Attribute(t,a,r,s,i);case F.ComponentType.UNSIGNED_SHORT:return n.AddUInt16Attribute(t,a,r,s,i);case F.ComponentType.SHORT:return n.AddInt16Attribute(t,a,r,s,i);case F.ComponentType.UNSIGNED_INT:return n.AddUInt32Attribute(t,a,r,s,i);case F.ComponentType.FLOAT:return n.AddFloatAttribute(t,a,r,s,i);default:throw new Error(`Unexpected component type, "${e}".`)}}class Ka extends Error{}class yr extends J{constructor(...e){super(...e),this.extensionName=$,this.prereadTypes=[E.PRIMITIVE],this.prewriteTypes=[E.ACCESSOR],this.readDependencies=["draco3d.decoder"],this.writeDependencies=["draco3d.encoder"],this._decoderModule=null,this._encoderModule=null,this._encoderOptions={}}install(e,t){return e==="draco3d.decoder"&&(this._decoderModule=t,lp(this._decoderModule)),e==="draco3d.encoder"&&(this._encoderModule=t,cp(this._encoderModule)),this}setEncoderOptions(e){return this._encoderOptions=e,this}preread(e){if(!this._decoderModule)throw new Error(`[${$}] Please install extension dependency, "draco3d.decoder".`);const t=this.document.getLogger(),a=e.jsonDoc,r=new Map;try{const s=a.json.meshes||[];for(const i of s)for(const o of i.primitives){if(!o.extensions||!o.extensions[$])continue;const l=o.extensions[$];let[c,h]=r.get(l.bufferView)||[];if(!h||!c){const d=a.json.bufferViews[l.bufferView],m=a.json.buffers[d.buffer],b=m.uri?a.resources[m.uri]:a.resources[qt],_=d.byteOffset||0,p=d.byteLength,v=B.toView(b,_,p);c=new this._decoderModule.Decoder,h=sp(c,v),r.set(l.bufferView,[c,h]),t.debug(`[${$}] Decompressed ${v.byteLength} bytes.`)}for(const d in l.attributes){const m=e.jsonDoc.json.accessors[o.attributes[d]],b=c.GetAttributeByUniqueId(h,l.attributes[d]),_=op(c,h,b,m);e.accessors[o.attributes[d]].setArray(_)}o.indices!==void 0&&e.accessors[o.indices].setArray(ip(c,h))}}finally{for(const[s,i]of Array.from(r.values()))this._decoderModule.destroy(s),this._decoderModule.destroy(i)}return this}read(e){return this}prewrite(e,t){if(!this._encoderModule)throw new Error(`[${$}] Please install extension dependency, "draco3d.encoder".`);const a=this.document.getLogger();a.debug(`[${$}] Compression options: ${JSON.stringify(this._encoderOptions)}`);const r=hp(this.document),s=new Map;let i="mesh";this._encoderOptions.quantizationVolume==="scene"&&(this.document.getRoot().listScenes().length!==1?a.warn(`[${$}]: quantizationVolume=scene requires exactly 1 scene.`):i=tf(this.document.getRoot().listScenes().pop()));for(const o of Array.from(r.keys())){const l=r.get(o);if(!l)throw new Error("Unexpected primitive.");if(s.has(l)){s.set(l,s.get(l));continue}const c=o.getIndices(),h=e.jsonDoc.json.accessors;let d;try{d=up(o,ct({},this._encoderOptions,{quantizationVolume:i}))}catch(_){if(_ instanceof Ka){a.warn(`[${$}]: ${_.message} Skipping primitive compression.`);continue}throw _}s.set(l,d);const m=e.createAccessorDef(c);m.count=d.numIndices,e.accessorIndexMap.set(c,h.length),h.push(m),d.numVertices>65534&&F.getComponentSize(m.componentType)<=2?m.componentType=F.ComponentType.UNSIGNED_INT:d.numVertices>254&&F.getComponentSize(m.componentType)<=1&&(m.componentType=F.ComponentType.UNSIGNED_SHORT);for(const _ of o.listSemantics()){const p=o.getAttribute(_);if(d.attributeIDs[_]===void 0)continue;const v=e.createAccessorDef(p);v.count=d.numVertices,e.accessorIndexMap.set(p,h.length),h.push(v)}const b=o.getAttribute("POSITION").getBuffer()||this.document.getRoot().listBuffers()[0];e.otherBufferViews.has(b)||e.otherBufferViews.set(b,[]),e.otherBufferViews.get(b).push(d.data)}return a.debug(`[${$}] Compressed ${r.size} primitives.`),e.extensionData[$]={primitiveHashMap:r,primitiveEncodingMap:s},this}write(e){const t=e.extensionData[$];for(const a of this.document.getRoot().listMeshes()){const r=e.jsonDoc.json.meshes[e.meshIndexMap.get(a)];for(let s=0;s<a.listPrimitives().length;s++){const i=a.listPrimitives()[s],o=r.primitives[s],l=t.primitiveHashMap.get(i);if(!l)continue;const c=t.primitiveEncodingMap.get(l);c&&(o.extensions=o.extensions||{},o.extensions[$]={bufferView:e.otherBufferViewsIndexMap.get(c.data),attributes:c.attributeIDs})}}if(!t.primitiveHashMap.size){const a=e.jsonDoc.json;a.extensionsUsed=(a.extensionsUsed||[]).filter(r=>r!==$),a.extensionsRequired=(a.extensionsRequired||[]).filter(r=>r!==$)}return this}}yr.EXTENSION_NAME=$;yr.EncoderMethod=Rn;function hp(n){const e=n.getLogger(),t=new Set,a=new Set;let r=0,s=0;for(const d of n.getRoot().listMeshes())for(const m of d.listPrimitives())m.getIndices()?m.getMode()!==Ne.Mode.TRIANGLES?(a.add(m),s++):t.add(m):(a.add(m),r++);r>0&&e.warn(`[${$}] Skipping Draco compression of ${r} non-indexed primitives.`),s>0&&e.warn(`[${$}] Skipping Draco compression of ${s} non-TRIANGLES primitives.`);const i=n.getRoot().listAccessors(),o=new Map;for(let d=0;d<i.length;d++)o.set(i[d],d);const l=new Map,c=new Set,h=new Map;for(const d of Array.from(t)){let m=ni(d,o);if(c.has(m)){h.set(d,m);continue}if(l.has(d.getIndices())){const b=d.getIndices(),_=b.clone();o.set(_,n.getRoot().listAccessors().length-1),d.swap(b,_)}for(const b of d.listAttributes())if(l.has(b)){const _=b.clone();o.set(_,n.getRoot().listAccessors().length-1),d.swap(b,_)}m=ni(d,o),c.add(m),h.set(d,m),l.set(d.getIndices(),m);for(const b of d.listAttributes())l.set(b,m)}for(const d of Array.from(l.keys())){const m=new Set(d.listParents().map(b=>b.propertyType));if(m.size!==2||!m.has(E.PRIMITIVE)||!m.has(E.ROOT))throw new Error(`[${$}] Compressed accessors must only be used as indices or vertex attributes.`)}for(const d of Array.from(t)){const m=h.get(d),b=d.getIndices();if(l.get(b)!==m||d.listAttributes().some(_=>l.get(_)!==m))throw new Error(`[${$}] Draco primitives must share all, or no, accessors.`)}for(const d of Array.from(a)){const m=d.getIndices();if(l.has(m)||d.listAttributes().some(b=>l.has(b)))throw new Error(`[${$}] Accessor cannot be shared by compressed and uncompressed primitives.`)}return h}function ni(n,e){const t=[],a=n.getIndices();t.push(e.get(a));for(const r of n.listAttributes())t.push(e.get(r));return t.sort().join("|")}class $t extends Z{init(){this.extensionName=Ie,this.propertyType="Light",this.parentTypes=[E.NODE]}getDefaults(){return Object.assign(super.getDefaults(),{color:[1,1,1],intensity:1,type:$t.Type.POINT,range:null,innerConeAngle:0,outerConeAngle:Math.PI/4})}getColor(){return this.get("color")}setColor(e){return this.set("color",e)}getIntensity(){return this.get("intensity")}setIntensity(e){return this.set("intensity",e)}getType(){return this.get("type")}setType(e){return this.set("type",e)}getRange(){return this.get("range")}setRange(e){return this.set("range",e)}getInnerConeAngle(){return this.get("innerConeAngle")}setInnerConeAngle(e){return this.set("innerConeAngle",e)}getOuterConeAngle(){return this.get("outerConeAngle")}setOuterConeAngle(e){return this.set("outerConeAngle",e)}}$t.EXTENSION_NAME=Ie;$t.Type={POINT:"point",SPOT:"spot",DIRECTIONAL:"directional"};class Jo extends J{constructor(...e){super(...e),this.extensionName=Ie}createLight(e=""){return new $t(this.document.getGraph(),e)}read(e){const t=e.jsonDoc;if(!t.json.extensions||!t.json.extensions[Ie])return this;const s=(t.json.extensions[Ie].lights||[]).map(i=>{var o,l;const c=this.createLight().setName(i.name||"").setType(i.type);return i.color!==void 0&&c.setColor(i.color),i.intensity!==void 0&&c.setIntensity(i.intensity),i.range!==void 0&&c.setRange(i.range),((o=i.spot)==null?void 0:o.innerConeAngle)!==void 0&&c.setInnerConeAngle(i.spot.innerConeAngle),((l=i.spot)==null?void 0:l.outerConeAngle)!==void 0&&c.setOuterConeAngle(i.spot.outerConeAngle),c});return t.json.nodes.forEach((i,o)=>{if(!i.extensions||!i.extensions[Ie])return;const l=i.extensions[Ie];e.nodes[o].setExtension(Ie,s[l.light])}),this}write(e){const t=e.jsonDoc;if(this.properties.size===0)return this;const a=[],r=new Map;for(const s of this.properties){const i=s,o={type:i.getType()};H.eq(i.getColor(),[1,1,1])||(o.color=i.getColor()),i.getIntensity()!==1&&(o.intensity=i.getIntensity()),i.getRange()!=null&&(o.range=i.getRange()),i.getName()&&(o.name=i.getName()),i.getType()===$t.Type.SPOT&&(o.spot={innerConeAngle:i.getInnerConeAngle(),outerConeAngle:i.getOuterConeAngle()}),a.push(o),r.set(i,a.length-1)}return this.document.getRoot().listNodes().forEach(s=>{const i=s.getExtension(Ie);if(i){const o=e.nodeIndexMap.get(s),l=t.json.nodes[o];l.extensions=l.extensions||{},l.extensions[Ie]={light:r.get(i)}}}),t.json.extensions=t.json.extensions||{},t.json.extensions[Ie]={lights:a},this}}Jo.EXTENSION_NAME=Ie;const{R:fp,G:pp,B:bp}=Pe;class Yo extends Z{init(){this.extensionName=Ke,this.propertyType="Anisotropy",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{anisotropyStrength:0,anisotropyRotation:0,anisotropyTexture:null,anisotropyTextureInfo:new X(this.graph,"anisotropyTextureInfo")})}getAnisotropyStrength(){return this.get("anisotropyStrength")}setAnisotropyStrength(e){return this.set("anisotropyStrength",e)}getAnisotropyRotation(){return this.get("anisotropyRotation")}setAnisotropyRotation(e){return this.set("anisotropyRotation",e)}getAnisotropyTexture(){return this.getRef("anisotropyTexture")}getAnisotropyTextureInfo(){return this.getRef("anisotropyTexture")?this.getRef("anisotropyTextureInfo"):null}setAnisotropyTexture(e){return this.setRef("anisotropyTexture",e,{channels:fp|pp|bp})}}Yo.EXTENSION_NAME=Ke;class $o extends J{constructor(...e){super(...e),this.extensionName=Ke,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createAnisotropy(){return new Yo(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[Ke]){const o=this.createAnisotropy();e.materials[i].setExtension(Ke,o);const l=s.extensions[Ke];if(l.anisotropyStrength!==void 0&&o.setAnisotropyStrength(l.anisotropyStrength),l.anisotropyRotation!==void 0&&o.setAnisotropyRotation(l.anisotropyRotation),l.anisotropyTexture!==void 0){const c=l.anisotropyTexture,h=e.textures[r[c.index].source];o.setAnisotropyTexture(h),e.setTextureInfo(o.getAnisotropyTextureInfo(),c)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(Ke);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[Ke]={};if(r.getAnisotropyStrength()>0&&(o.anisotropyStrength=r.getAnisotropyStrength()),r.getAnisotropyRotation()!==0&&(o.anisotropyRotation=r.getAnisotropyRotation()),r.getAnisotropyTexture()){const l=r.getAnisotropyTexture(),c=r.getAnisotropyTextureInfo();o.anisotropyTexture=e.createTextureInfoDef(l,c)}}}),this}}$o.EXTENSION_NAME=Ke;const{R:ai,G:ri,B:mp}=Pe;class Qo extends Z{init(){this.extensionName=qe,this.propertyType="Clearcoat",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{clearcoatFactor:0,clearcoatTexture:null,clearcoatTextureInfo:new X(this.graph,"clearcoatTextureInfo"),clearcoatRoughnessFactor:0,clearcoatRoughnessTexture:null,clearcoatRoughnessTextureInfo:new X(this.graph,"clearcoatRoughnessTextureInfo"),clearcoatNormalScale:1,clearcoatNormalTexture:null,clearcoatNormalTextureInfo:new X(this.graph,"clearcoatNormalTextureInfo")})}getClearcoatFactor(){return this.get("clearcoatFactor")}setClearcoatFactor(e){return this.set("clearcoatFactor",e)}getClearcoatTexture(){return this.getRef("clearcoatTexture")}getClearcoatTextureInfo(){return this.getRef("clearcoatTexture")?this.getRef("clearcoatTextureInfo"):null}setClearcoatTexture(e){return this.setRef("clearcoatTexture",e,{channels:ai})}getClearcoatRoughnessFactor(){return this.get("clearcoatRoughnessFactor")}setClearcoatRoughnessFactor(e){return this.set("clearcoatRoughnessFactor",e)}getClearcoatRoughnessTexture(){return this.getRef("clearcoatRoughnessTexture")}getClearcoatRoughnessTextureInfo(){return this.getRef("clearcoatRoughnessTexture")?this.getRef("clearcoatRoughnessTextureInfo"):null}setClearcoatRoughnessTexture(e){return this.setRef("clearcoatRoughnessTexture",e,{channels:ri})}getClearcoatNormalScale(){return this.get("clearcoatNormalScale")}setClearcoatNormalScale(e){return this.set("clearcoatNormalScale",e)}getClearcoatNormalTexture(){return this.getRef("clearcoatNormalTexture")}getClearcoatNormalTextureInfo(){return this.getRef("clearcoatNormalTexture")?this.getRef("clearcoatNormalTextureInfo"):null}setClearcoatNormalTexture(e){return this.setRef("clearcoatNormalTexture",e,{channels:ai|ri|mp})}}Qo.EXTENSION_NAME=qe;class Zo extends J{constructor(...e){super(...e),this.extensionName=qe,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createClearcoat(){return new Qo(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[qe]){const o=this.createClearcoat();e.materials[i].setExtension(qe,o);const l=s.extensions[qe];if(l.clearcoatFactor!==void 0&&o.setClearcoatFactor(l.clearcoatFactor),l.clearcoatRoughnessFactor!==void 0&&o.setClearcoatRoughnessFactor(l.clearcoatRoughnessFactor),l.clearcoatTexture!==void 0){const c=l.clearcoatTexture,h=e.textures[r[c.index].source];o.setClearcoatTexture(h),e.setTextureInfo(o.getClearcoatTextureInfo(),c)}if(l.clearcoatRoughnessTexture!==void 0){const c=l.clearcoatRoughnessTexture,h=e.textures[r[c.index].source];o.setClearcoatRoughnessTexture(h),e.setTextureInfo(o.getClearcoatRoughnessTextureInfo(),c)}if(l.clearcoatNormalTexture!==void 0){const c=l.clearcoatNormalTexture,h=e.textures[r[c.index].source];o.setClearcoatNormalTexture(h),e.setTextureInfo(o.getClearcoatNormalTextureInfo(),c),c.scale!==void 0&&o.setClearcoatNormalScale(c.scale)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(qe);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[qe]={clearcoatFactor:r.getClearcoatFactor(),clearcoatRoughnessFactor:r.getClearcoatRoughnessFactor()};if(r.getClearcoatTexture()){const l=r.getClearcoatTexture(),c=r.getClearcoatTextureInfo();o.clearcoatTexture=e.createTextureInfoDef(l,c)}if(r.getClearcoatRoughnessTexture()){const l=r.getClearcoatRoughnessTexture(),c=r.getClearcoatRoughnessTextureInfo();o.clearcoatRoughnessTexture=e.createTextureInfoDef(l,c)}if(r.getClearcoatNormalTexture()){const l=r.getClearcoatNormalTexture(),c=r.getClearcoatNormalTextureInfo();o.clearcoatNormalTexture=e.createTextureInfoDef(l,c),r.getClearcoatNormalScale()!==1&&(o.clearcoatNormalTexture.scale=r.getClearcoatNormalScale())}}}),this}}Zo.EXTENSION_NAME=qe;const{R:gp,G:vp,B:xp,A:Sp}=Pe;class el extends Z{init(){this.extensionName=Je,this.propertyType="DiffuseTransmission",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{diffuseTransmissionFactor:0,diffuseTransmissionTexture:null,diffuseTransmissionTextureInfo:new X(this.graph,"diffuseTransmissionTextureInfo"),diffuseTransmissionColorFactor:[1,1,1],diffuseTransmissionColorTexture:null,diffuseTransmissionColorTextureInfo:new X(this.graph,"diffuseTransmissionColorTextureInfo")})}getDiffuseTransmissionFactor(){return this.get("diffuseTransmissionFactor")}setDiffuseTransmissionFactor(e){return this.set("diffuseTransmissionFactor",e)}getDiffuseTransmissionTexture(){return this.getRef("diffuseTransmissionTexture")}getDiffuseTransmissionTextureInfo(){return this.getRef("diffuseTransmissionTexture")?this.getRef("diffuseTransmissionTextureInfo"):null}setDiffuseTransmissionTexture(e){return this.setRef("diffuseTransmissionTexture",e,{channels:Sp})}getDiffuseTransmissionColorFactor(){return this.get("diffuseTransmissionColorFactor")}setDiffuseTransmissionColorFactor(e){return this.set("diffuseTransmissionColorFactor",e)}getDiffuseTransmissionColorTexture(){return this.getRef("diffuseTransmissionColorTexture")}getDiffuseTransmissionColorTextureInfo(){return this.getRef("diffuseTransmissionColorTexture")?this.getRef("diffuseTransmissionColorTextureInfo"):null}setDiffuseTransmissionColorTexture(e){return this.setRef("diffuseTransmissionColorTexture",e,{channels:gp|vp|xp})}}el.EXTENSION_NAME=Je;class tl extends J{constructor(...e){super(...e),this.extensionName=Je}createDiffuseTransmission(){return new el(this.document.getGraph())}read(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[Je]){const o=this.createDiffuseTransmission();e.materials[i].setExtension(Je,o);const l=s.extensions[Je];if(l.diffuseTransmissionFactor!==void 0&&o.setDiffuseTransmissionFactor(l.diffuseTransmissionFactor),l.diffuseTransmissionColorFactor!==void 0&&o.setDiffuseTransmissionColorFactor(l.diffuseTransmissionColorFactor),l.diffuseTransmissionTexture!==void 0){const c=l.diffuseTransmissionTexture,h=e.textures[r[c.index].source];o.setDiffuseTransmissionTexture(h),e.setTextureInfo(o.getDiffuseTransmissionTextureInfo(),c)}if(l.diffuseTransmissionColorTexture!==void 0){const c=l.diffuseTransmissionColorTexture,h=e.textures[r[c.index].source];o.setDiffuseTransmissionColorTexture(h),e.setTextureInfo(o.getDiffuseTransmissionColorTextureInfo(),c)}}}),this}write(e){const t=e.jsonDoc;for(const a of this.document.getRoot().listMaterials()){const r=a.getExtension(Je);if(!r)continue;const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[Je]={diffuseTransmissionFactor:r.getDiffuseTransmissionFactor(),diffuseTransmissionColorFactor:r.getDiffuseTransmissionColorFactor()};if(r.getDiffuseTransmissionTexture()){const l=r.getDiffuseTransmissionTexture(),c=r.getDiffuseTransmissionTextureInfo();o.diffuseTransmissionTexture=e.createTextureInfoDef(l,c)}if(r.getDiffuseTransmissionColorTexture()){const l=r.getDiffuseTransmissionColorTexture(),c=r.getDiffuseTransmissionColorTextureInfo();o.diffuseTransmissionColorTexture=e.createTextureInfoDef(l,c)}}return this}}tl.EXTENSION_NAME=Je;class nl extends Z{init(){this.extensionName=Ye,this.propertyType="Dispersion",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{dispersion:0})}getDispersion(){return this.get("dispersion")}setDispersion(e){return this.set("dispersion",e)}}nl.EXTENSION_NAME=Ye;class al extends J{constructor(...e){super(...e),this.extensionName=Ye,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createDispersion(){return new nl(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){return(e.jsonDoc.json.materials||[]).forEach((r,s)=>{if(r.extensions&&r.extensions[Ye]){const i=this.createDispersion();e.materials[s].setExtension(Ye,i);const o=r.extensions[Ye];o.dispersion!==void 0&&i.setDispersion(o.dispersion)}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(Ye);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{},i.extensions[Ye]={dispersion:r.getDispersion()}}}),this}}al.EXTENSION_NAME=Ye;class rl extends Z{init(){this.extensionName=$e,this.propertyType="EmissiveStrength",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{emissiveStrength:1})}getEmissiveStrength(){return this.get("emissiveStrength")}setEmissiveStrength(e){return this.set("emissiveStrength",e)}}rl.EXTENSION_NAME=$e;class sl extends J{constructor(...e){super(...e),this.extensionName=$e,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createEmissiveStrength(){return new rl(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){return(e.jsonDoc.json.materials||[]).forEach((r,s)=>{if(r.extensions&&r.extensions[$e]){const i=this.createEmissiveStrength();e.materials[s].setExtension($e,i);const o=r.extensions[$e];o.emissiveStrength!==void 0&&i.setEmissiveStrength(o.emissiveStrength)}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension($e);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{},i.extensions[$e]={emissiveStrength:r.getEmissiveStrength()}}}),this}}sl.EXTENSION_NAME=$e;class il extends Z{init(){this.extensionName=Qe,this.propertyType="IOR",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{ior:1.5})}getIOR(){return this.get("ior")}setIOR(e){return this.set("ior",e)}}il.EXTENSION_NAME=Qe;class ol extends J{constructor(...e){super(...e),this.extensionName=Qe,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createIOR(){return new il(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){return(e.jsonDoc.json.materials||[]).forEach((r,s)=>{if(r.extensions&&r.extensions[Qe]){const i=this.createIOR();e.materials[s].setExtension(Qe,i);const o=r.extensions[Qe];o.ior!==void 0&&i.setIOR(o.ior)}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(Qe);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{},i.extensions[Qe]={ior:r.getIOR()}}}),this}}ol.EXTENSION_NAME=Qe;const{R:Tp,G:wp}=Pe;class ll extends Z{init(){this.extensionName=Ze,this.propertyType="Iridescence",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{iridescenceFactor:0,iridescenceTexture:null,iridescenceTextureInfo:new X(this.graph,"iridescenceTextureInfo"),iridescenceIOR:1.3,iridescenceThicknessMinimum:100,iridescenceThicknessMaximum:400,iridescenceThicknessTexture:null,iridescenceThicknessTextureInfo:new X(this.graph,"iridescenceThicknessTextureInfo")})}getIridescenceFactor(){return this.get("iridescenceFactor")}setIridescenceFactor(e){return this.set("iridescenceFactor",e)}getIridescenceTexture(){return this.getRef("iridescenceTexture")}getIridescenceTextureInfo(){return this.getRef("iridescenceTexture")?this.getRef("iridescenceTextureInfo"):null}setIridescenceTexture(e){return this.setRef("iridescenceTexture",e,{channels:Tp})}getIridescenceIOR(){return this.get("iridescenceIOR")}setIridescenceIOR(e){return this.set("iridescenceIOR",e)}getIridescenceThicknessMinimum(){return this.get("iridescenceThicknessMinimum")}setIridescenceThicknessMinimum(e){return this.set("iridescenceThicknessMinimum",e)}getIridescenceThicknessMaximum(){return this.get("iridescenceThicknessMaximum")}setIridescenceThicknessMaximum(e){return this.set("iridescenceThicknessMaximum",e)}getIridescenceThicknessTexture(){return this.getRef("iridescenceThicknessTexture")}getIridescenceThicknessTextureInfo(){return this.getRef("iridescenceThicknessTexture")?this.getRef("iridescenceThicknessTextureInfo"):null}setIridescenceThicknessTexture(e){return this.setRef("iridescenceThicknessTexture",e,{channels:wp})}}ll.EXTENSION_NAME=Ze;class cl extends J{constructor(...e){super(...e),this.extensionName=Ze,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createIridescence(){return new ll(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[Ze]){const o=this.createIridescence();e.materials[i].setExtension(Ze,o);const l=s.extensions[Ze];if(l.iridescenceFactor!==void 0&&o.setIridescenceFactor(l.iridescenceFactor),l.iridescenceIor!==void 0&&o.setIridescenceIOR(l.iridescenceIor),l.iridescenceThicknessMinimum!==void 0&&o.setIridescenceThicknessMinimum(l.iridescenceThicknessMinimum),l.iridescenceThicknessMaximum!==void 0&&o.setIridescenceThicknessMaximum(l.iridescenceThicknessMaximum),l.iridescenceTexture!==void 0){const c=l.iridescenceTexture,h=e.textures[r[c.index].source];o.setIridescenceTexture(h),e.setTextureInfo(o.getIridescenceTextureInfo(),c)}if(l.iridescenceThicknessTexture!==void 0){const c=l.iridescenceThicknessTexture,h=e.textures[r[c.index].source];o.setIridescenceThicknessTexture(h),e.setTextureInfo(o.getIridescenceThicknessTextureInfo(),c)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(Ze);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[Ze]={};if(r.getIridescenceFactor()>0&&(o.iridescenceFactor=r.getIridescenceFactor()),r.getIridescenceIOR()!==1.3&&(o.iridescenceIor=r.getIridescenceIOR()),r.getIridescenceThicknessMinimum()!==100&&(o.iridescenceThicknessMinimum=r.getIridescenceThicknessMinimum()),r.getIridescenceThicknessMaximum()!==400&&(o.iridescenceThicknessMaximum=r.getIridescenceThicknessMaximum()),r.getIridescenceTexture()){const l=r.getIridescenceTexture(),c=r.getIridescenceTextureInfo();o.iridescenceTexture=e.createTextureInfoDef(l,c)}if(r.getIridescenceThicknessTexture()){const l=r.getIridescenceThicknessTexture(),c=r.getIridescenceThicknessTextureInfo();o.iridescenceThicknessTexture=e.createTextureInfoDef(l,c)}}}),this}}cl.EXTENSION_NAME=Ze;const{R:si,G:ii,B:oi,A:li}=Pe;class ul extends Z{init(){this.extensionName=et,this.propertyType="PBRSpecularGlossiness",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{diffuseFactor:[1,1,1,1],diffuseTexture:null,diffuseTextureInfo:new X(this.graph,"diffuseTextureInfo"),specularFactor:[1,1,1],glossinessFactor:1,specularGlossinessTexture:null,specularGlossinessTextureInfo:new X(this.graph,"specularGlossinessTextureInfo")})}getDiffuseFactor(){return this.get("diffuseFactor")}setDiffuseFactor(e){return this.set("diffuseFactor",e)}getDiffuseTexture(){return this.getRef("diffuseTexture")}getDiffuseTextureInfo(){return this.getRef("diffuseTexture")?this.getRef("diffuseTextureInfo"):null}setDiffuseTexture(e){return this.setRef("diffuseTexture",e,{channels:si|ii|oi|li,isColor:!0})}getSpecularFactor(){return this.get("specularFactor")}setSpecularFactor(e){return this.set("specularFactor",e)}getGlossinessFactor(){return this.get("glossinessFactor")}setGlossinessFactor(e){return this.set("glossinessFactor",e)}getSpecularGlossinessTexture(){return this.getRef("specularGlossinessTexture")}getSpecularGlossinessTextureInfo(){return this.getRef("specularGlossinessTexture")?this.getRef("specularGlossinessTextureInfo"):null}setSpecularGlossinessTexture(e){return this.setRef("specularGlossinessTexture",e,{channels:si|ii|oi|li})}}ul.EXTENSION_NAME=et;class _l extends J{constructor(...e){super(...e),this.extensionName=et,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createPBRSpecularGlossiness(){return new ul(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[et]){const o=this.createPBRSpecularGlossiness();e.materials[i].setExtension(et,o);const l=s.extensions[et];if(l.diffuseFactor!==void 0&&o.setDiffuseFactor(l.diffuseFactor),l.specularFactor!==void 0&&o.setSpecularFactor(l.specularFactor),l.glossinessFactor!==void 0&&o.setGlossinessFactor(l.glossinessFactor),l.diffuseTexture!==void 0){const c=l.diffuseTexture,h=e.textures[r[c.index].source];o.setDiffuseTexture(h),e.setTextureInfo(o.getDiffuseTextureInfo(),c)}if(l.specularGlossinessTexture!==void 0){const c=l.specularGlossinessTexture,h=e.textures[r[c.index].source];o.setSpecularGlossinessTexture(h),e.setTextureInfo(o.getSpecularGlossinessTextureInfo(),c)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(et);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[et]={diffuseFactor:r.getDiffuseFactor(),specularFactor:r.getSpecularFactor(),glossinessFactor:r.getGlossinessFactor()};if(r.getDiffuseTexture()){const l=r.getDiffuseTexture(),c=r.getDiffuseTextureInfo();o.diffuseTexture=e.createTextureInfoDef(l,c)}if(r.getSpecularGlossinessTexture()){const l=r.getSpecularGlossinessTexture(),c=r.getSpecularGlossinessTextureInfo();o.specularGlossinessTexture=e.createTextureInfoDef(l,c)}}}),this}}_l.EXTENSION_NAME=et;const{R:yp,G:Ep,B:Cp,A:Ip}=Pe;class dl extends Z{init(){this.extensionName=tt,this.propertyType="Sheen",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{sheenColorFactor:[0,0,0],sheenColorTexture:null,sheenColorTextureInfo:new X(this.graph,"sheenColorTextureInfo"),sheenRoughnessFactor:0,sheenRoughnessTexture:null,sheenRoughnessTextureInfo:new X(this.graph,"sheenRoughnessTextureInfo")})}getSheenColorFactor(){return this.get("sheenColorFactor")}setSheenColorFactor(e){return this.set("sheenColorFactor",e)}getSheenColorTexture(){return this.getRef("sheenColorTexture")}getSheenColorTextureInfo(){return this.getRef("sheenColorTexture")?this.getRef("sheenColorTextureInfo"):null}setSheenColorTexture(e){return this.setRef("sheenColorTexture",e,{channels:yp|Ep|Cp,isColor:!0})}getSheenRoughnessFactor(){return this.get("sheenRoughnessFactor")}setSheenRoughnessFactor(e){return this.set("sheenRoughnessFactor",e)}getSheenRoughnessTexture(){return this.getRef("sheenRoughnessTexture")}getSheenRoughnessTextureInfo(){return this.getRef("sheenRoughnessTexture")?this.getRef("sheenRoughnessTextureInfo"):null}setSheenRoughnessTexture(e){return this.setRef("sheenRoughnessTexture",e,{channels:Ip})}}dl.EXTENSION_NAME=tt;class hl extends J{constructor(...e){super(...e),this.extensionName=tt,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createSheen(){return new dl(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[tt]){const o=this.createSheen();e.materials[i].setExtension(tt,o);const l=s.extensions[tt];if(l.sheenColorFactor!==void 0&&o.setSheenColorFactor(l.sheenColorFactor),l.sheenRoughnessFactor!==void 0&&o.setSheenRoughnessFactor(l.sheenRoughnessFactor),l.sheenColorTexture!==void 0){const c=l.sheenColorTexture,h=e.textures[r[c.index].source];o.setSheenColorTexture(h),e.setTextureInfo(o.getSheenColorTextureInfo(),c)}if(l.sheenRoughnessTexture!==void 0){const c=l.sheenRoughnessTexture,h=e.textures[r[c.index].source];o.setSheenRoughnessTexture(h),e.setTextureInfo(o.getSheenRoughnessTextureInfo(),c)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(tt);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[tt]={sheenColorFactor:r.getSheenColorFactor(),sheenRoughnessFactor:r.getSheenRoughnessFactor()};if(r.getSheenColorTexture()){const l=r.getSheenColorTexture(),c=r.getSheenColorTextureInfo();o.sheenColorTexture=e.createTextureInfoDef(l,c)}if(r.getSheenRoughnessTexture()){const l=r.getSheenRoughnessTexture(),c=r.getSheenRoughnessTextureInfo();o.sheenRoughnessTexture=e.createTextureInfoDef(l,c)}}}),this}}hl.EXTENSION_NAME=tt;const{R:Rp,G:Ap,B:Dp,A:Mp}=Pe;class fl extends Z{init(){this.extensionName=nt,this.propertyType="Specular",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{specularFactor:1,specularTexture:null,specularTextureInfo:new X(this.graph,"specularTextureInfo"),specularColorFactor:[1,1,1],specularColorTexture:null,specularColorTextureInfo:new X(this.graph,"specularColorTextureInfo")})}getSpecularFactor(){return this.get("specularFactor")}setSpecularFactor(e){return this.set("specularFactor",e)}getSpecularColorFactor(){return this.get("specularColorFactor")}setSpecularColorFactor(e){return this.set("specularColorFactor",e)}getSpecularTexture(){return this.getRef("specularTexture")}getSpecularTextureInfo(){return this.getRef("specularTexture")?this.getRef("specularTextureInfo"):null}setSpecularTexture(e){return this.setRef("specularTexture",e,{channels:Mp})}getSpecularColorTexture(){return this.getRef("specularColorTexture")}getSpecularColorTextureInfo(){return this.getRef("specularColorTexture")?this.getRef("specularColorTextureInfo"):null}setSpecularColorTexture(e){return this.setRef("specularColorTexture",e,{channels:Rp|Ap|Dp,isColor:!0})}}fl.EXTENSION_NAME=nt;class pl extends J{constructor(...e){super(...e),this.extensionName=nt,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createSpecular(){return new fl(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[nt]){const o=this.createSpecular();e.materials[i].setExtension(nt,o);const l=s.extensions[nt];if(l.specularFactor!==void 0&&o.setSpecularFactor(l.specularFactor),l.specularColorFactor!==void 0&&o.setSpecularColorFactor(l.specularColorFactor),l.specularTexture!==void 0){const c=l.specularTexture,h=e.textures[r[c.index].source];o.setSpecularTexture(h),e.setTextureInfo(o.getSpecularTextureInfo(),c)}if(l.specularColorTexture!==void 0){const c=l.specularColorTexture,h=e.textures[r[c.index].source];o.setSpecularColorTexture(h),e.setTextureInfo(o.getSpecularColorTextureInfo(),c)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(nt);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[nt]={};if(r.getSpecularFactor()!==1&&(o.specularFactor=r.getSpecularFactor()),H.eq(r.getSpecularColorFactor(),[1,1,1])||(o.specularColorFactor=r.getSpecularColorFactor()),r.getSpecularTexture()){const l=r.getSpecularTexture(),c=r.getSpecularTextureInfo();o.specularTexture=e.createTextureInfoDef(l,c)}if(r.getSpecularColorTexture()){const l=r.getSpecularColorTexture(),c=r.getSpecularColorTextureInfo();o.specularColorTexture=e.createTextureInfoDef(l,c)}}}),this}}pl.EXTENSION_NAME=nt;const{R:Pp}=Pe;class bl extends Z{init(){this.extensionName=at,this.propertyType="Transmission",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{transmissionFactor:0,transmissionTexture:null,transmissionTextureInfo:new X(this.graph,"transmissionTextureInfo")})}getTransmissionFactor(){return this.get("transmissionFactor")}setTransmissionFactor(e){return this.set("transmissionFactor",e)}getTransmissionTexture(){return this.getRef("transmissionTexture")}getTransmissionTextureInfo(){return this.getRef("transmissionTexture")?this.getRef("transmissionTextureInfo"):null}setTransmissionTexture(e){return this.setRef("transmissionTexture",e,{channels:Pp})}}bl.EXTENSION_NAME=at;class ml extends J{constructor(...e){super(...e),this.extensionName=at,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createTransmission(){return new bl(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[at]){const o=this.createTransmission();e.materials[i].setExtension(at,o);const l=s.extensions[at];if(l.transmissionFactor!==void 0&&o.setTransmissionFactor(l.transmissionFactor),l.transmissionTexture!==void 0){const c=l.transmissionTexture,h=e.textures[r[c.index].source];o.setTransmissionTexture(h),e.setTextureInfo(o.getTransmissionTextureInfo(),c)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(at);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[at]={transmissionFactor:r.getTransmissionFactor()};if(r.getTransmissionTexture()){const l=r.getTransmissionTexture(),c=r.getTransmissionTextureInfo();o.transmissionTexture=e.createTextureInfoDef(l,c)}}}),this}}ml.EXTENSION_NAME=at;class gl extends Z{init(){this.extensionName=mt,this.propertyType="Unlit",this.parentTypes=[E.MATERIAL]}}gl.EXTENSION_NAME=mt;class vl extends J{constructor(...e){super(...e),this.extensionName=mt,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createUnlit(){return new gl(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){return(e.jsonDoc.json.materials||[]).forEach((a,r)=>{a.extensions&&a.extensions[mt]&&e.materials[r].setExtension(mt,this.createUnlit())}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{if(a.getExtension(mt)){const r=e.materialIndexMap.get(a),s=t.json.materials[r];s.extensions=s.extensions||{},s.extensions[mt]={}}}),this}}vl.EXTENSION_NAME=mt;class xl extends Z{init(){this.extensionName=_e,this.propertyType="Mapping",this.parentTypes=["MappingList"]}getDefaults(){return Object.assign(super.getDefaults(),{material:null,variants:new K})}getMaterial(){return this.getRef("material")}setMaterial(e){return this.setRef("material",e)}addVariant(e){return this.addRef("variants",e)}removeVariant(e){return this.removeRef("variants",e)}listVariants(){return this.listRefs("variants")}}xl.EXTENSION_NAME=_e;class Sl extends Z{init(){this.extensionName=_e,this.propertyType="MappingList",this.parentTypes=[E.PRIMITIVE]}getDefaults(){return Object.assign(super.getDefaults(),{mappings:new K})}addMapping(e){return this.addRef("mappings",e)}removeMapping(e){return this.removeRef("mappings",e)}listMappings(){return this.listRefs("mappings")}}Sl.EXTENSION_NAME=_e;class qa extends Z{init(){this.extensionName=_e,this.propertyType="Variant",this.parentTypes=["MappingList"]}}qa.EXTENSION_NAME=_e;class Tl extends J{constructor(...e){super(...e),this.extensionName=_e}createMappingList(){return new Sl(this.document.getGraph())}createVariant(e=""){return new qa(this.document.getGraph(),e)}createMapping(){return new xl(this.document.getGraph())}listVariants(){return Array.from(this.properties).filter(e=>e instanceof qa)}read(e){const t=e.jsonDoc;if(!t.json.extensions||!t.json.extensions[_e])return this;const s=(t.json.extensions[_e].variants||[]).map(o=>this.createVariant().setName(o.name||""));return(t.json.meshes||[]).forEach((o,l)=>{const c=e.meshes[l];(o.primitives||[]).forEach((d,m)=>{if(!d.extensions||!d.extensions[_e])return;const b=this.createMappingList(),_=d.extensions[_e];for(const p of _.mappings){const v=this.createMapping();p.material!==void 0&&v.setMaterial(e.materials[p.material]);for(const u of p.variants||[])v.addVariant(s[u]);b.addMapping(v)}c.listPrimitives()[m].setExtension(_e,b)})}),this}write(e){const t=e.jsonDoc,a=this.listVariants();if(!a.length)return this;const r=[],s=new Map;for(const i of a)s.set(i,r.length),r.push(e.createPropertyDef(i));for(const i of this.document.getRoot().listMeshes()){const o=e.meshIndexMap.get(i);i.listPrimitives().forEach((l,c)=>{const h=l.getExtension(_e);if(!h)return;const d=e.jsonDoc.json.meshes[o].primitives[c],m=h.listMappings().map(b=>{const _=e.createPropertyDef(b),p=b.getMaterial();return p&&(_.material=e.materialIndexMap.get(p)),_.variants=b.listVariants().map(v=>s.get(v)),_});d.extensions=d.extensions||{},d.extensions[_e]={mappings:m}})}return t.json.extensions=t.json.extensions||{},t.json.extensions[_e]={variants:r},this}}Tl.EXTENSION_NAME=_e;const{G:Fp}=Pe;class wl extends Z{init(){this.extensionName=rt,this.propertyType="Volume",this.parentTypes=[E.MATERIAL]}getDefaults(){return Object.assign(super.getDefaults(),{thicknessFactor:0,thicknessTexture:null,thicknessTextureInfo:new X(this.graph,"thicknessTexture"),attenuationDistance:1/0,attenuationColor:[1,1,1]})}getThicknessFactor(){return this.get("thicknessFactor")}setThicknessFactor(e){return this.set("thicknessFactor",e)}getThicknessTexture(){return this.getRef("thicknessTexture")}getThicknessTextureInfo(){return this.getRef("thicknessTexture")?this.getRef("thicknessTextureInfo"):null}setThicknessTexture(e){return this.setRef("thicknessTexture",e,{channels:Fp})}getAttenuationDistance(){return this.get("attenuationDistance")}setAttenuationDistance(e){return this.set("attenuationDistance",e)}getAttenuationColor(){return this.get("attenuationColor")}setAttenuationColor(e){return this.set("attenuationColor",e)}}wl.EXTENSION_NAME=rt;class yl extends J{constructor(...e){super(...e),this.extensionName=rt,this.prereadTypes=[E.MESH],this.prewriteTypes=[E.MESH]}createVolume(){return new wl(this.document.getGraph())}read(e){return this}write(e){return this}preread(e){const t=e.jsonDoc,a=t.json.materials||[],r=t.json.textures||[];return a.forEach((s,i)=>{if(s.extensions&&s.extensions[rt]){const o=this.createVolume();e.materials[i].setExtension(rt,o);const l=s.extensions[rt];if(l.thicknessFactor!==void 0&&o.setThicknessFactor(l.thicknessFactor),l.attenuationDistance!==void 0&&o.setAttenuationDistance(l.attenuationDistance),l.attenuationColor!==void 0&&o.setAttenuationColor(l.attenuationColor),l.thicknessTexture!==void 0){const c=l.thicknessTexture,h=e.textures[r[c.index].source];o.setThicknessTexture(h),e.setTextureInfo(o.getThicknessTextureInfo(),c)}}}),this}prewrite(e){const t=e.jsonDoc;return this.document.getRoot().listMaterials().forEach(a=>{const r=a.getExtension(rt);if(r){const s=e.materialIndexMap.get(a),i=t.json.materials[s];i.extensions=i.extensions||{};const o=i.extensions[rt]={};if(r.getThicknessFactor()>0&&(o.thicknessFactor=r.getThicknessFactor()),Number.isFinite(r.getAttenuationDistance())&&(o.attenuationDistance=r.getAttenuationDistance()),H.eq(r.getAttenuationColor(),[1,1,1])||(o.attenuationColor=r.getAttenuationColor()),r.getThicknessTexture()){const l=r.getThicknessTexture(),c=r.getThicknessTextureInfo();o.thicknessTexture=e.createTextureInfoDef(l,c)}}}),this}}yl.EXTENSION_NAME=rt;class El extends J{constructor(...e){super(...e),this.extensionName=Lo}read(e){return this}write(e){return this}}El.EXTENSION_NAME=Lo;class Cl extends Z{init(){this.extensionName=st,this.propertyType="Visibility",this.parentTypes=[E.NODE]}getDefaults(){return Object.assign(super.getDefaults(),{visible:!0})}getVisible(){return this.get("visible")}setVisible(e){return this.set("visible",e)}}Cl.EXTENSION_NAME=st;class Il extends J{constructor(...e){super(...e),this.extensionName=st}createVisibility(){return new Cl(this.document.getGraph())}read(e){return(e.jsonDoc.json.nodes||[]).forEach((r,s)=>{if(r.extensions&&r.extensions[st]){const i=this.createVisibility();e.nodes[s].setExtension(st,i);const o=r.extensions[st];o.visible!==void 0&&i.setVisible(o.visible)}}),this}write(e){const t=e.jsonDoc;for(const a of this.document.getRoot().listNodes()){const r=a.getExtension(st);if(!r)continue;const s=e.nodeIndexMap.get(a),i=t.json.nodes[s];i.extensions=i.extensions||{},i.extensions[st]={visible:r.getVisible()}}return this}}Il.EXTENSION_NAME=st;class kp{match(e){return e[0]===171&&e[1]===75&&e[2]===84&&e[3]===88&&e[4]===32&&e[5]===50&&e[6]===48&&e[7]===187&&e[8]===13&&e[9]===10&&e[10]===26&&e[11]===10}getSize(e){const t=Ma(e);return[t.pixelWidth,t.pixelHeight]}getChannels(e){const a=Ma(e).dataFormatDescriptor[0];if(a.colorModel===Lf)return a.samples.length===2&&(a.samples[1].channelType&15)===15?4:3;if(a.colorModel===Uf)return(a.samples[0].channelType&15)===3?4:3;throw new Error(`Unexpected KTX2 colorModel, "${a.colorModel}".`)}getVRAMByteLength(e){const t=Ma(e),a=this.getChannels(e)>3;let r=0;for(let s=0;s<t.levels.length;s++){const i=t.levels[s];if(i.uncompressedByteLength)r+=i.uncompressedByteLength;else{const o=Math.max(1,Math.floor(t.pixelWidth/Math.pow(2,s))),l=Math.max(1,Math.floor(t.pixelHeight/Math.pow(2,s))),c=a?16:8;r+=o/4*(l/4)*c}}return r}}class Rl extends J{constructor(...e){super(...e),this.extensionName=bn,this.prereadTypes=[E.TEXTURE]}static register(){Ue.registerFormat("image/ktx2",new kp)}preread(e){return e.jsonDoc.json.textures&&e.jsonDoc.json.textures.forEach(t=>{if(t.extensions&&t.extensions[bn]){const a=t.extensions[bn];t.source=a.source}}),this}read(e){return this}write(e){const t=e.jsonDoc;return this.document.getRoot().listTextures().forEach(a=>{if(a.getMimeType()==="image/ktx2"){const r=e.imageIndexMap.get(a);t.json.textures.forEach(s=>{s.source===r&&(s.extensions=s.extensions||{},s.extensions[bn]={source:s.source},delete s.source)})}}),this}}Rl.EXTENSION_NAME=bn;class Al extends Z{init(){this.extensionName=it,this.propertyType="Transform",this.parentTypes=[E.TEXTURE_INFO]}getDefaults(){return Object.assign(super.getDefaults(),{offset:[0,0],rotation:0,scale:[1,1],texCoord:null})}getOffset(){return this.get("offset")}setOffset(e){return this.set("offset",e)}getRotation(){return this.get("rotation")}setRotation(e){return this.set("rotation",e)}getScale(){return this.get("scale")}setScale(e){return this.set("scale",e)}getTexCoord(){return this.get("texCoord")}setTexCoord(e){return this.set("texCoord",e)}}Al.EXTENSION_NAME=it;class Dl extends J{constructor(...e){super(...e),this.extensionName=it}createTransform(){return new Al(this.document.getGraph())}read(e){for(const[t,a]of Array.from(e.textureInfos.entries())){if(!a.extensions||!a.extensions[it])continue;const r=this.createTransform(),s=a.extensions[it];s.offset!==void 0&&r.setOffset(s.offset),s.rotation!==void 0&&r.setRotation(s.rotation),s.scale!==void 0&&r.setScale(s.scale),s.texCoord!==void 0&&r.setTexCoord(s.texCoord),t.setExtension(it,r)}return this}write(e){const t=Array.from(e.textureInfoDefMap.entries());for(const[a,r]of t){const s=a.getExtension(it);if(!s)continue;r.extensions=r.extensions||{};const i={},o=H.eq;o(s.getOffset(),[0,0])||(i.offset=s.getOffset()),s.getRotation()!==0&&(i.rotation=s.getRotation()),o(s.getScale(),[1,1])||(i.scale=s.getScale()),s.getTexCoord()!=null&&(i.texCoord=s.getTexCoord()),r.extensions[it]=i}return this}}Dl.EXTENSION_NAME=it;const Np=[E.ROOT,E.SCENE,E.NODE,E.MESH,E.MATERIAL,E.TEXTURE,E.ANIMATION];class Ml extends Z{init(){this.extensionName=Re,this.propertyType="Packet",this.parentTypes=Np}getDefaults(){return Object.assign(super.getDefaults(),{context:{},properties:{}})}getContext(){return this.get("context")}setContext(e){return this.set("context",ct({},e))}listProperties(){return Object.keys(this.get("properties"))}getProperty(e){const t=this.get("properties");return e in t?t[e]:null}setProperty(e,t){this._assertContext(e);const a=ct({},this.get("properties"));return t?a[e]=t:delete a[e],this.set("properties",a)}toJSONLD(){const e=Pa(this.get("context")),t=Pa(this.get("properties"));return ct({"@context":e},t)}fromJSONLD(e){e=Pa(e);const t=e["@context"];return t&&this.set("context",t),delete e["@context"],this.set("properties",e)}_assertContext(e){if(!(e.split(":")[0]in this.get("context")))throw new Error(`${Re}: Missing context for term, "${e}".`)}}Ml.EXTENSION_NAME=Re;function Pa(n){return JSON.parse(JSON.stringify(n))}class Pl extends J{constructor(...e){super(...e),this.extensionName=Re}createPacket(){return new Ml(this.document.getGraph())}listPackets(){return Array.from(this.properties)}read(e){var t;const a=(t=e.jsonDoc.json.extensions)==null?void 0:t[Re];if(!a||!a.packets)return this;const r=e.jsonDoc.json,s=this.document.getRoot(),i=a.packets.map(c=>this.createPacket().fromJSONLD(c)),o=[[r.asset],r.scenes,r.nodes,r.meshes,r.materials,r.images,r.animations],l=[[s],s.listScenes(),s.listNodes(),s.listMeshes(),s.listMaterials(),s.listTextures(),s.listAnimations()];for(let c=0;c<o.length;c++){const h=o[c]||[];for(let d=0;d<h.length;d++){const m=h[d];if(m.extensions&&m.extensions[Re]){const b=m.extensions[Re];l[c][d].setExtension(Re,i[b.packet])}}}return this}write(e){const{json:t}=e.jsonDoc,a=[];for(const r of this.properties){a.push(r.toJSONLD());for(const s of r.listParents()){let i;switch(s.propertyType){case E.ROOT:i=t.asset;break;case E.SCENE:i=t.scenes[e.sceneIndexMap.get(s)];break;case E.NODE:i=t.nodes[e.nodeIndexMap.get(s)];break;case E.MESH:i=t.meshes[e.meshIndexMap.get(s)];break;case E.MATERIAL:i=t.materials[e.materialIndexMap.get(s)];break;case E.TEXTURE:i=t.images[e.imageIndexMap.get(s)];break;case E.ANIMATION:i=t.animations[e.animationIndexMap.get(s)];break;default:i=null,this.document.getLogger().warn(`[${Re}]: Unsupported parent property, "${s.propertyType}"`);break}i&&(i.extensions=i.extensions||{},i.extensions[Re]={packet:a.length-1})}}return a.length>0&&(t.extensions=t.extensions||{},t.extensions[Re]={packets:a}),this}}Pl.EXTENSION_NAME=Re;const jp=[yr,Jo,$o,Zo,tl,al,sl,ol,cl,_l,pl,hl,ml,vl,Tl,yl,El,Il,Rl,Dl,Pl],Fl=[Go,wr,zo,Ho,...jp];function oa(){return oa=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var a in t)({}).hasOwnProperty.call(t,a)&&(n[a]=t[a])}return n},oa.apply(null,arguments)}const{POINTS:h0,LINES:f0,LINE_STRIP:p0,LINE_LOOP:b0,TRIANGLES:m0,TRIANGLE_STRIP:g0,TRIANGLE_FAN:v0}=Ne.Mode;function Bp(n,e){return Object.defineProperty(e,"name",{value:n}),e}function kl(n,e){const t=oa({},n);for(const a in e)e[a]!==void 0&&(t[a]=e[a]);return t}var la=typeof Float32Array<"u"?Float32Array:Array,ci;(function(n){n.RENDER="render",n.RENDER_CACHED="render-cached",n.UPLOAD="upload",n.UPLOAD_NAIVE="upload-naive",n.DISTINCT="distinct",n.DISTINCT_POSITION="distinct-position",n.UNUSED="unused"})(ci||(ci={}));function Op(){var n=new la(3);return la!=Float32Array&&(n[0]=0,n[1]=0,n[2]=0),n}(function(){var n=Op();return function(e,t,a,r,s,i){var o,l;for(t||(t=3),a||(a=0),r?l=Math.min(r*t+a,e.length):l=e.length,o=a;o<l;o+=t)n[0]=e[o],n[1]=e[o+1],n[2]=e[o+2],s(n,n,i),e[o]=n[0],e[o+1]=n[1],e[o+2]=n[2];return e}})();const{FLOAT:x0}=F.ComponentType,{LINES:S0,LINE_STRIP:T0,LINE_LOOP:w0,TRIANGLES:y0,TRIANGLE_STRIP:E0,TRIANGLE_FAN:C0}=Ne.Mode;E.ACCESSOR,E.MESH,E.TEXTURE,E.MATERIAL,E.SKIN;const ui="dequantize",ca={pattern:/^((?!JOINTS_).)*$/};function Nl(n=ca){const e=kl(ca,n);return Bp(ui,t=>{const a=t.getLogger();for(const r of t.getRoot().listMeshes())for(const s of r.listPrimitives())Vp(s,e);t.disposeExtension("KHR_mesh_quantization"),a.debug(`${ui}: Complete.`)})}function Vp(n,e=ca){const t=kl(ca,e);for(const a of n.listSemantics())t.pattern.test(a)&&_i(n.getAttribute(a));for(const a of n.listTargets())for(const r of a.listSemantics())t.pattern.test(r)&&_i(a.getAttribute(r))}function _i(n){const e=n.getArray();if(!e)return;const t=Lp(e,n.getComponentType(),n.getNormalized());n.setArray(t).setNormalized(!1)}function Lp(n,e,t){const a=new Float32Array(n.length);for(let r=0,s=n.length;r<s;r++)t?a[r]=H.decodeNormalizedInt(n[r],e):a[r]=n[r];return a}const{TEXTURE_INFO:I0,ROOT:R0}=E;function Up(){var n=new la(4);return la!=Float32Array&&(n[0]=0,n[1]=0,n[2]=0,n[3]=0),n}(function(){var n=Up();return function(e,t,a,r,s,i){var o,l;for(t||(t=4),a||(a=0),r?l=Math.min(r*t+a,e.length):l=e.length,o=a;o<l;o+=t)n[0]=e[o],n[1]=e[o+1],n[2]=e[o+2],n[3]=e[o+3],s(n,n,i),e[o]=n[0],e[o+1]=n[1],e[o+2]=n[2],e[o+3]=n[3];return e}})();E.NODE,E.SKIN,E.MESH,E.CAMERA,E.PRIMITIVE,E.PRIMITIVE_TARGET,E.ANIMATION,E.MATERIAL,E.TEXTURE,E.ACCESSOR,E.BUFFER;const{LINE_STRIP:A0,LINE_LOOP:D0,TRIANGLE_STRIP:M0,TRIANGLE_FAN:P0}=Ne.Mode,{ROOT:F0,NODE:k0,MESH:N0,PRIMITIVE:j0,ACCESSOR:B0}=E,{TRANSLATION:O0,ROTATION:V0,SCALE:L0,WEIGHTS:U0}=ga.TargetPath,Gp={pattern:/.*/,quantizationVolume:"mesh",quantizePosition:14,quantizeNormal:10,quantizeTexcoord:12,quantizeColor:8,quantizeWeight:8,quantizeGeneric:12,normalizeWeights:!0,cleanup:!0};oa({level:"high"},Gp);var di;(function(n){n[n.STEP=0]="STEP",n[n.LERP=1]="LERP",n[n.SLERP=2]="SLERP"})(di||(di={}));Promise.resolve();const{POINTS:G0,LINES:W0,LINE_STRIP:z0,LINE_LOOP:H0,TRIANGLES:X0,TRIANGLE_STRIP:K0,TRIANGLE_FAN:q0}=Ne.Mode;var Ja;(function(n){n.LANCZOS3="lanczos3",n.LANCZOS2="lanczos2"})(Ja||(Ja={}));Ja.LANCZOS3;var ua=(function(){var n="b9H79TebbbeJq9Geueu9Geub9Gbb9Gvuuuuueu9Gduueu9Gluuuueu9Gvuuuuub9Gouuuuuub9Gluuuub9GiuuueuiKLdilevlevlooroowwvwbDDbelve9Weiiviebeoweuec:G;kekr;RiOo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9FW9U9J9V9KW9wWVtW949c919M9MWVbe8F9TW79O9V9Wt9FW9U9J9V9KW9wWVtW949c919M9MWV9c9V919U9KbdE9TW79O9V9Wt9FW9U9J9V9KW9wWVtW949wWV79P9V9UbiY9TW79O9V9Wt9FW9U9J9V9KW69U9KW949c919M9MWVbl8E9TW79O9V9Wt9FW9U9J9V9KW69U9KW949c919M9MWV9c9V919U9Kbv8A9TW79O9V9Wt9FW9U9J9V9KW69U9KW949wWV79P9V9UboE9TW79O9V9Wt9FW9U9J9V9KW69U9KW949tWG91W9U9JWbra9TW79O9V9Wt9FW9U9J9V9KW69U9KW949tWG91W9U9JW9c9V919U9KbwL9TW79O9V9Wt9FW9U9J9V9KWS9P2tWV9p9JtbDK9TW79O9V9Wt9FW9U9J9V9KWS9P2tWV9r919HtbqL9TW79O9V9Wt9FW9U9J9V9KWS9P2tWVT949WbkE9TW79O9V9Wt9F9V9Wt9P9T9P96W9wWVtW94J9H9J9OWbPa9TW79O9V9Wt9F9V9Wt9P9T9P96W9wWVtW94J9H9J9OW9ttV9P9Wbsa9TW79O9V9Wt9F9V9Wt9P9T9P96W9wWVtW94SWt9J9O9sW9T9H9WbzK9TW79O9V9Wt9F79W9Ht9P9H29t9VVt9sW9T9H9WbHl79IV9RbODwebcekdQXq;C9oLdbk;GqeKu8Jjjjjbcjo9Rgv8Kjjjjbcbhodnalcefae0mbabcbRbN:kjjbc:GeV86bbavcjdfcbcjdzNjjjb8AdnaiTmbavcjdfadalz:tjjjb8Akabaefhrabcefhwavalfcbcbcjdal9RalcFe0EzNjjjb8Aavavcjdfalz:tjjjbhDcj;abal9Uc;WFbGgecjdaecjd6Ehqcbhkindndnaiak9nmbaDcjlfcbcjdzNjjjb8Aaqaiak9Rakaqfai6Egxcsfgecl4cifcd4hmadakal2fhPdndndnaec9WGgsTmbcbhzaPhHawhOxekdnaxmbalheinaraw9Ram6miawcbamzNjjjbamfhwaecufgembxvkkcbhAaPhOinaDaAfRbbhCaDcjlfheaOhoaxhXinaeaoRbbgQaC9RgCcetaC;acr4786bbaoalfhoaecefheaQhCaXcufgXmbkaraw9Ram6mdaOcefhOawcbamzNjjjbamfhwaAcefgAal9hmbxlkkindnaxTmbaDazfRbbhCaDcjlfheaHhoaxhXinaeaoRbbgQaC9RgCcetaC;acr4786bbaoalfhoaecefheaQhCaXcufgXmbkkaraO9Ram6mearaOcbamzNjjjbgLamfgw9RcK6mecbhKaDcjlfhOinaDcjlfaKfhYcwhAczhQceheindndnaegXce9hmbcuhoaYRbbmecbhodninaogecsSmeaecefhoaOaefcefRbbTmbkkcucbaecs6EhoxekaXcethocuaXtc;:bGcFb7hCcbheinaoaCaOaefRbb9nfhoaecefgecz9hmbkkaoaQaoaQ6geEhQaXaAaeEhAaXcetheaXcl6mbkdndndndnaAcufPdiebkaLaKco4fgeaeRbbcdciaAclSEaKci4coGtV86bbaAcw9hmeawaY8Pbb83bbawcwfaYcwf8Pbb83bbawczfhwxdkaLaKco4fgeaeRbbceaKci4coGtV86bbkdncwaA9Tg8Ambinawcb86bbawcefhwxbkkcuaAtcu7hYcbhEaOh3ina3hea8AhCcbhoinaeRbbgQaYcFeGgXaQaX6EaoaAtVhoaecefheaCcufgCmbkawao86bba3a8Afh3awcefhwaEa8AfgEcz6mbkcbheindnaOaefRbbgoaX6mbawao86bbawcefhwkaecefgecz9hmbkkdnaKczfgKas9pmbaOczfhOaraw9RcL0mekkaKas6meawTmeaHcefhHawhOazcefgzalSmixbkkcbhoxikcbhoaraw9Ralcaalca0E6mddnalc8F0mbawcbcaal9RgezNjjjbaefhwkawaDcjdfalz:tjjjbalfab9RhoxdkaDaPaxcufal2falz:tjjjb8Aaxakfhkawmbkcbhokavcjof8Kjjjjbaok9heeuaecaaeca0Eabcj;abae9Uc;WFbGgdcjdadcjd6Egdfcufad9Uae2adcl4cifcd4adV2fcefkmbcbabBdN:kjjbk:zse5u8Jjjjjbc;ae9Rgl8Kjjjjbcbhvdnaici9UgocHfae0mbabcbyd:e:kjjbgrc;GeV86bbalc;abfcFecjezNjjjb8AalcUfgw9cu83ibalc8WfgD9cu83ibalcyfgq9cu83ibalcafgk9cu83ibalcKfgx9cu83ibalczfgm9cu83ibal9cu83iwal9cu83ibabaefc9WfhPabcefgsaofhednaiTmbcmcsarcb9kgzEhHcbhOcbhAcbhCcbhXcbhQindnaeaP9nmbcbhvxikaQcufhvadaCcdtfgLydbhKaLcwfydbhYaLclfydbh8AcbhEdndndninalc;abfavcsGcitfgoydlh3dndndnaoydbgoaK9hmba3a8ASmekdnaoa8A9hmba3aY9hmbaEcefhExekaoaY9hmea3aK9hmeaEcdfhEkaEc870mdaXcufhvaLaEciGcx2goc:y1jjbfydbcdtfydbh3aLaocN1jjbfydbcdtfydbh8AaLaoc:q1jjbfydbcdtfydbhKcbhodnindnalavcsGcdtfydba39hmbaohYxdkcuhYavcufhvaocefgocz9hmbkkaOa3aOSgvaYce9iaYaH9oVgoGfhOdndndncbcsavEaYaoEgvcs9hmbarce9imba3a3aAa3cefaASgvEgAcefSmecmcsavEhvkasavaEcdtc;WeGV86bbavcs9hmea3aA9Rgvcetavc8F917hvinaeavcFb0crtavcFbGV86bbaecefheavcje6hoavcr4hvaoTmbka3hAxvkcPhvasaEcdtcPV86bba3hAkavTmiavaH9omicdhocehEaQhYxlkavcufhvaEclfgEc;ab9hmbkkdnaLceaYaOSceta8AaOSEcx2gvc:q1jjbfydbcdtfydbgKTaLavcN1jjbfydbcdtfydbg8AceSGaLavc:y1jjbfydbcdtfydbg3cdSGaOcb9hGazGg5ce9hmbaw9cu83ibaD9cu83ibaq9cu83ibak9cu83ibax9cu83ibam9cu83ibal9cu83iwal9cu83ibcbhOkcbhEaXcufgvhodnindnalaocsGcdtfydba8A9hmbaEhYxdkcuhYaocufhoaEcefgEcz9hmbkkcbhodnindnalavcsGcdtfydba39hmbaohExdkcuhEavcufhvaocefgocz9hmbkkaOaKaOSg8EfhLdndnaYcm0mbaYcefhYxekcbcsa8AaLSgvEhYaLavfhLkdndnaEcm0mbaEcefhExekcbcsa3aLSgvEhEaLavfhLkc9:cua8EEh8FcbhvaEaYcltVgacFeGhodndndninavcj1jjbfRbbaoSmeavcefgvcz9hmbxdkka5aKaO9havcm0VVmbasavc;WeV86bbxekasa8F86bbaeaa86bbaecefhekdna8EmbaKaA9Rgvcetavc8F917hvinaeavcFb0gocrtavcFbGV86bbavcr4hvaecefheaombkaKhAkdnaYcs9hmba8AaA9Rgvcetavc8F917hvinaeavcFb0gocrtavcFbGV86bbavcr4hvaecefheaombka8AhAkdnaEcs9hmba3aA9Rgvcetavc8F917hvinaeavcFb0gocrtavcFbGV86bbavcr4hvaecefheaombka3hAkalaXcdtfaKBdbaXcefcsGhvdndnaYPzbeeeeeeeeeeeeeebekalavcdtfa8ABdbaXcdfcsGhvkdndnaEPzbeeeeeeeeeeeeeebekalavcdtfa3BdbavcefcsGhvkcihoalc;abfaQcitfgEaKBdlaEa8ABdbaQcefcsGhYcdhEavhXaLhOxekcdhoalaXcdtfa3BdbcehEaXcefcsGhXaQhYkalc;abfaYcitfgva8ABdlava3Bdbalc;abfaQaEfcsGcitfgva3BdlavaKBdbascefhsaQaofcsGhQaCcifgCai6mbkkcbhvaeaP0mbcbhvinaeavfavcj1jjbfRbb86bbavcefgvcz9hmbkaeab9Ravfhvkalc;aef8KjjjjbavkZeeucbhddninadcefgdc8F0meceadtae6mbkkadcrfcFeGcr9Uci2cdfabci9U2cHfkmbcbabBd:e:kjjbk:ydewu8Jjjjjbcz9Rhlcbhvdnaicvfae0mbcbhvabcbRb:e:kjjbc;qeV86bbal9cb83iwabcefhoabaefc98fhrdnaiTmbcbhwcbhDindnaoar6mbcbskadaDcdtfydbgqalcwfawaqav9Rgvavc8F91gv7av9Rc507gwcdtfgkydb9Rgvc8E91c9:Gavcdt7awVhvinaoavcFb0gecrtavcFbGV86bbavcr4hvaocefhoaembkakaqBdbaqhvaDcefgDai9hmbkkcbhvaoar0mbaocbBbbaoab9RclfhvkavkBeeucbhddninadcefgdc8F0meceadtae6mbkkadcwfcFeGcr9Uab2cvfk:bvli99dui99ludnaeTmbcuadcetcuftcu7:Yhvdndncuaicuftcu7:YgoJbbbZMgr:lJbbb9p9DTmbar:Ohwxekcjjjj94hwkcbhicbhDinalclfIdbgrJbbbbJbbjZalIdbgq:lar:lMalcwfIdbgk:lMgr:varJbbbb9BEgrNhxaqarNhrdndnakJbbbb9GTmbaxhqxekJbbjZar:l:tgqaq:maxJbbbb9GEhqJbbjZax:l:tgxax:marJbbbb9GEhrkdndnalcxfIdbgxJbbj:;axJbbj:;9GEgkJbbjZakJbbjZ9FEavNJbbbZJbbb:;axJbbbb9GEMgx:lJbbb9p9DTmbax:Ohmxekcjjjj94hmkdndnaqJbbj:;aqJbbj:;9GEgxJbbjZaxJbbjZ9FEaoNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:OhPxekcjjjj94hPkdndnarJbbj:;arJbbj:;9GEgqJbbjZaqJbbjZ9FEaoNJbbbZJbbb:;arJbbbb9GEMgr:lJbbb9p9DTmbar:Ohsxekcjjjj94hskdndnadcl9hmbabaifgzas86bbazcifam86bbazcdfaw86bbazcefaP86bbxekabaDfgzas87ebazcofam87ebazclfaw87ebazcdfaP87ebkalczfhlaiclfhiaDcwfhDaecufgembkkk;hlld99eud99eudnaeTmbdndncuaicuftcu7:YgvJbbbZMgo:lJbbb9p9DTmbao:Ohixekcjjjj94hikaic;8FiGhrinabcofcicdalclfIdb:lalIdb:l9EgialcwfIdb:lalaicdtfIdb:l9EEgialcxfIdb:lalaicdtfIdb:l9EEgiarV87ebdndnJbbj:;JbbjZalaicdtfIdbJbbbb9DEgoalaicd7cdtfIdbJ;Zl:1ZNNgwJbbj:;awJbbj:;9GEgDJbbjZaDJbbjZ9FEavNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohqxekcjjjj94hqkabcdfaq87ebdndnalaicefciGcdtfIdbJ;Zl:1ZNaoNgwJbbj:;awJbbj:;9GEgDJbbjZaDJbbjZ9FEavNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohqxekcjjjj94hqkabaq87ebdndnaoalaicufciGcdtfIdbJ;Zl:1ZNNgoJbbj:;aoJbbj:;9GEgwJbbjZawJbbjZ9FEavNJbbbZJbbb:;aoJbbbb9GEMgo:lJbbb9p9DTmbao:Ohixekcjjjj94hikabclfai87ebabcwfhbalczfhlaecufgembkkk:dvdxue998Jjjjjbcjd9Rgo8Kjjjjbadcd4hrdndndndnavcd9hmbadcl6meaohwarhDinawc:CuBdbawclfhwaDcufgDmbkaeTmiadcl6mdarcdthqalhkcbhxinaohwakhDarhminawawydbgPaDydbgscL4cFeGc:cufcbasEgsaPas9kEBdbaDclfhDawclfhwamcufgmmbkakaqfhkaxcefgxaeSmixbkkaeTmdxekaeTmekavcb9hadcl6gqVhzarcdthxavce9hhHcbhdindndndnaHmbaqmdc:CuhDalhwarhminaDawydbgPcL4cFeGc:cufcbaPEgPaDaP9kEhDawclfhwamcufgmmbxdkkc:CuhDazmbaohwalhmarhPinawamydbgscL4cFeGgkc8Aakc8A9kEc:cufcbasEBdbamclfhmawclfhwaPcufgPmbkkaqmbcbhwarhPinaDhmdnavceSmbaoawfydbhmkdndnalawfIdbgOcjjj;8iamai9RcefgmcLt9R::NJbbbZJbbb:;aOJbbbb9GEMgO:lJbbb9p9DTmbaO:Ohsxekcjjjj94hskabawfascFFFrGamcKtVBdbawclfhwaPcufgPmbkkabaxfhbalaxfhladcefgdae9hmbkkaocjdf8Kjjjjbk;HqdCui998Jjjjjbc:qd9Rgv8Kjjjjbavc:Sefcbc;KbzNjjjb8AcbhodnadTmbcbhoaiTmbdnabae9hmbavcuadcdtgradcFFFFi0Ecbyd:m:kjjbHjjjjbbgeBd:SeavceBd:mdaeabarz:tjjjb8Akavc:GefcwfcbBdbav9cb83i:Geavc:Gefaeadaiavc:Sefz:njjjbavyd:Gehwadci9UgDcbyd:m:kjjbHjjjjbbhravc:Sefavyd:mdgqcdtfarBdbavaqcefgkBd:mdarcbaDzNjjjbhxavc:SefakcdtfcuaicdtaicFFFFi0Ecbyd:m:kjjbHjjjjbbgmBdbavaqcdfgPBd:mdawhramhkinakalIdbalarydbgscwascw6Ecdtfc;ebfIdbMUdbarclfhrakclfhkaicufgimbkavc:SefaPcdtfcuaDcdtadcFFFF970Ecbyd:m:kjjbHjjjjbbgPBdbdnadci6mbaehraPhkaDhiinakamarydbcdtfIdbamarclfydbcdtfIdbMamarcwfydbcdtfIdbMUdbarcxfhrakclfhkaicufgimbkkaqcifhoavc;qbfhzavhravyd:KehHavyd:OehOcbhscbhkcbhAcehCinarhXcihQaeakci2gLcdtfgrydbhdarclfydbhqabaAcx2fgicwfarcwfydbgKBdbaiclfaqBdbaiadBdbaxakfce86bbazaKBdwazaqBdlazadBdbaPakcdtfcbBdbdnasTmbcihQaXhiinazaQcdtfaiydbgrBdbaQaraK9harad9haraq9hGGfhQaiclfhiascufgsmbkkaAcefhAcbhsinaOaHaeasaLfcdtfydbcdtgifydbcdtfgKhrawaifgqydbgdhidnadTmbdninarydbakSmearclfhraicufgiTmdxbkkaraKadcdtfc98fydbBdbaqaqydbcufBdbkascefgsci9hmbkdndnaQTmbcuhkJbbbbhYcbhqavyd:KehKavyd:OehLindndnawazaqcdtfydbcdtgsfydbgrmbaqcefhqxekaqcs0hiamasfgdIdbh8AadalcbaqcefgqaiEcdtfIdbalarcwarcw6Ecdtfc;ebfIdbMgEUdbaEa8A:thEarcdthiaLaKasfydbcdtfhrinaParydbgscdtfgdaEadIdbMg8AUdba8AaYaYa8A9DgdEhYasakadEhkarclfhraic98fgimbkkaqaQ9hmbkakcu9hmekaCaD9pmdindnaxaCfRbbmbaChkxdkaDaCcefgC9hmbxikkaQczaQcz6EhsazhraXhzakcu9hmbkkaocdtavc:Seffc98fhrdninaoTmearydbcbyd1:kjjbH:bjjjbbarc98fhraocufhoxbkkavc:qdf8Kjjjjbk;IlevucuaicdtgvaicFFFFi0Egocbyd:m:kjjbHjjjjbbhralalyd9GgwcdtfarBdbalawcefBd9GabarBdbaocbyd:m:kjjbHjjjjbbhralalyd9GgocdtfarBdbalaocefBd9GabarBdlcuadcdtadcFFFFi0Ecbyd:m:kjjbHjjjjbbhralalyd9GgocdtfarBdbalaocefBd9GabarBdwabydbcbavzNjjjb8Aadci9UhDdnadTmbabydbhoaehladhrinaoalydbcdtfgvavydbcefBdbalclfhlarcufgrmbkkdnaiTmbabydbhlabydlhrcbhvaihoinaravBdbarclfhralydbavfhvalclfhlaocufgombkkdnadci6mbabydlhrabydwhvcbhlinaecwfydbhoaeclfydbhdaraeydbcdtfgwawydbgwcefBdbavawcdtfalBdbaradcdtfgdadydbgdcefBdbavadcdtfalBdbaraocdtfgoaoydbgocefBdbavaocdtfalBdbaecxfheaDalcefgl9hmbkkdnaiTmbabydlheabydbhlinaeaeydbalydb9RBdbalclfhlaeclfheaicufgimbkkkQbabaeadaic:01jjbz:mjjjbkQbabaeadaic:C:jjjbz:mjjjbk9DeeuabcFeaicdtzNjjjbhlcbhbdnadTmbindnalaeydbcdtfgiydbcu9hmbaiabBdbabcefhbkaeclfheadcufgdmbkkabk;Wkivuo99lu8Jjjjjbc;W;Gb9Rgl8Kjjjjbcbhvalcj;Gbfcbc;KbzNjjjb8AalcuadcdtadcFFFFi0Egocbyd:m:kjjbHjjjjbbgrBdj9GalceBd;G9GalcFFF;7rBdwal9cFFF;7;3FF:;Fb83dbalcFFF97Bd;S9Gal9cFFF;7FFF:;u83d;K9Gaicd4hwdndnadmbJFFuFhDJFFuuhqJFFuuhkJFFuFhxJFFuuhmJFFuFhPxekawcdthsaehzincbhiinalaifgHazaifIdbgDaHIdbgxaxaD9EEUdbalc;K;GbfaifgHaDaHIdbgxaxaD9DEUdbaiclfgicx9hmbkazasfhzavcefgvad9hmbkalIdwhqalId;S9GhDalIdlhkalId;O9GhxalIdbhmalId;K9GhPkdndnadTmbJbbbbJbbjZJbbbbaPam:tgPaPJbbbb9DEgPaxak:tgxaxaP9DEgxaDaq:tgDaDax9DEgD:vaDJbbbb9BEhDawcdthsarhHadhzindndnaDaeIdbam:tNJb;au9eNJbbbZMgx:lJbbb9p9DTmbax:Ohixekcjjjj94hikaicztaicwtcj;GiGVaicsGVc:p;G:dKGcH2c;d;H:WKGcv2c;j:KM;jbGhvdndnaDaeclfIdbak:tNJb;au9eNJbbbZMgx:lJbbb9p9DTmbax:Ohixekcjjjj94hikaicztaicwtcj;GiGVaicsGVc:p;G:dKGcH2c;d;H:WKGcq2cM;j:KMeGavVhvdndnaDaecwfIdbaq:tNJb;au9eNJbbbZMgx:lJbbb9p9DTmbax:Ohixekcjjjj94hikaHavaicztaicwtcj;GiGVaicsGVc:p;G:dKGcH2c;d;H:WKGcC2c:KM;j:KdGVBdbaeasfheaHclfhHazcufgzmbkalcbcj;GbzNjjjbhiarhHadheinaiaHydbgzcFrGcx2fgvavydbcefBdbaiazcq4cFrGcx2fgvavydlcefBdlaiazcC4cFrGcx2fgzazydwcefBdwaHclfhHaecufgembxdkkalcbcj;GbzNjjjb8AkcbhHcbhzcbhecbhvinalaHfgiydbhsaiazBdbaicwfgwydbhOawavBdbaiclfgiydbhwaiaeBdbasazfhzaOavfhvawaefheaHcxfgHcj;Gb9hmbkcbhHalaocbyd:m:kjjbHjjjjbbgiBd:e9GdnadTmbabhzinazaHBdbazclfhzadaHcefgH9hmbkabhHadhzinalaraHydbgecdtfydbcFrGcx2fgvavydbgvcefBdbaiavcdtfaeBdbaHclfhHazcufgzmbkaihHadhzinalaraHydbgecdtfydbcq4cFrGcx2fgvavydlgvcefBdlabavcdtfaeBdbaHclfhHazcufgzmbkabhHadhzinalaraHydbgecdtfydbcC4cFrGcx2fgvavydwgvcefBdwaiavcdtfaeBdbaHclfhHazcufgzmbkcbhHinabaiydbcdtfaHBdbaiclfhiadaHcefgH9hmbkkclhidninaic98Smealcj;Gbfaifydbcbyd1:kjjbH:bjjjbbaic98fhixbkkalc;W;Gbf8Kjjjjbk9teiucbcbyd:q:kjjbgeabcifc98GfgbBd:q:kjjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabk9teiucbcbyd:q:kjjbgeabcrfc94GfgbBd:q:kjjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik9:eiuZbhedndncbyd:q:kjjbgdaecztgi9nmbcuheadai9RcFFifcz4nbcuSmekadhekcbabae9Rcifc98Gcbyd:q:kjjbfgdBd:q:kjjbdnadZbcztge9nmbadae9RcFFifcz4nb8Akkk:Iddbcjwk:edb4:h9w9N94:P:gW:j9O:ye9Pbbbbbbebbbdbbbebbbdbbbbbbbdbbbbbbbebbbbbbb:l29hZ;69:9kZ;N;76Z;rg97Z;z;o9xZ8J;B85Z;:;u9yZ;b;k9HZ:2;Z9DZ9e:l9mZ59A8KZ:r;T3Z:A:zYZ79OHZ;j4::8::Y:D9V8:bbbb9s:49:Z8R:hBZ9M9M;M8:L;z;o8:;8:PG89q;x:J878R:hQ8::M:B;e87bbbbbbjZbbjZbbjZ:E;V;N8::Y:DsZ9i;H;68:xd;R8:;h0838:;W:NoZbbbb:WV9O8:uf888:9i;H;68:9c9G;L89;n;m9m89;D8Ko8:bbbbf:8tZ9m836ZS:2AZL;zPZZ818EZ9e:lxZ;U98F8:819E;68:bc:eqkzebbbebbbdbbbaWbb",e=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var t,a=WebAssembly.instantiate(r(n),{}).then(function(b){t=b.instance,t.exports.__wasm_call_ctors(),t.exports.meshopt_encodeVertexVersion(0),t.exports.meshopt_encodeIndexVersion(1)});function r(b){for(var _=new Uint8Array(b.length),p=0;p<b.length;++p){var v=b.charCodeAt(p);_[p]=v>96?v-97:v>64?v-39:v+4}for(var u=0,p=0;p<b.length;++p)_[u++]=_[p]<60?e[_[p]]:(_[p]-60)*64+_[++p];return _.buffer.slice(0,u)}function s(b){if(!b)throw new Error("Assertion failed")}function i(b){return new Uint8Array(b.buffer,b.byteOffset,b.byteLength)}function o(b,_,p,v){var u=t.exports.sbrk,S=u(_.length*4),g=u(p*4),x=new Uint8Array(t.exports.memory.buffer),T=i(_);x.set(T,S),v&&v(S,S,_.length,p);var C=b(g,S,_.length,p);x=new Uint8Array(t.exports.memory.buffer);var f=new Uint32Array(p);new Uint8Array(f.buffer).set(x.subarray(g,g+p*4)),T.set(x.subarray(S,S+_.length*4)),u(S-u(0));for(var w=0;w<_.length;++w)_[w]=f[_[w]];return[f,C]}function l(b,_,p,v){var u=t.exports.sbrk,S=u(p*4),g=u(p*v),x=new Uint8Array(t.exports.memory.buffer);x.set(i(_),g),b(S,g,p,v),x=new Uint8Array(t.exports.memory.buffer);var T=new Uint32Array(p);return new Uint8Array(T.buffer).set(x.subarray(S,S+p*4)),u(S-u(0)),T}function c(b,_,p,v,u){var S=t.exports.sbrk,g=S(_),x=S(v*u),T=new Uint8Array(t.exports.memory.buffer);T.set(i(p),x);var C=b(g,_,x,v,u),f=new Uint8Array(C);return f.set(T.subarray(g,g+C)),S(g-S(0)),f}function h(b){for(var _=0,p=0;p<b.length;++p){var v=b[p];_=_<v?v:_}return _}function d(b,_){if(s(_==2||_==4),_==4)return new Uint32Array(b.buffer,b.byteOffset,b.byteLength/4);var p=new Uint16Array(b.buffer,b.byteOffset,b.byteLength/2);return new Uint32Array(p)}function m(b,_,p,v,u,S,g){var x=t.exports.sbrk,T=x(p*v),C=x(p*S),f=new Uint8Array(t.exports.memory.buffer);f.set(i(_),C),b(T,p,v,u,C,g);var w=new Uint8Array(p*v);return w.set(f.subarray(T,T+p*v)),x(T-x(0)),w}return{ready:a,supported:!0,reorderMesh:function(b,_,p){var v=_?p?t.exports.meshopt_optimizeVertexCacheStrip:t.exports.meshopt_optimizeVertexCache:void 0;return o(t.exports.meshopt_optimizeVertexFetchRemap,b,h(b)+1,v)},reorderPoints:function(b,_){return s(b instanceof Float32Array),s(b.length%_==0),s(_>=3),l(t.exports.meshopt_spatialSortRemap,b,b.length/_,_*4)},encodeVertexBuffer:function(b,_,p){s(p>0&&p<=256),s(p%4==0);var v=t.exports.meshopt_encodeVertexBufferBound(_,p);return c(t.exports.meshopt_encodeVertexBuffer,v,b,_,p)},encodeIndexBuffer:function(b,_,p){s(p==2||p==4),s(_%3==0);var v=d(b,p),u=t.exports.meshopt_encodeIndexBufferBound(_,h(v)+1);return c(t.exports.meshopt_encodeIndexBuffer,u,v,_,4)},encodeIndexSequence:function(b,_,p){s(p==2||p==4);var v=d(b,p),u=t.exports.meshopt_encodeIndexSequenceBound(_,h(v)+1);return c(t.exports.meshopt_encodeIndexSequence,u,v,_,4)},encodeGltfBuffer:function(b,_,p,v){var u={ATTRIBUTES:this.encodeVertexBuffer,TRIANGLES:this.encodeIndexBuffer,INDICES:this.encodeIndexSequence};return s(u[v]),u[v](b,_,p)},encodeFilterOct:function(b,_,p,v){return s(p==4||p==8),s(v>=1&&v<=16),m(t.exports.meshopt_encodeFilterOct,b,_,p,v,16)},encodeFilterQuat:function(b,_,p,v){return s(p==8),s(v>=4&&v<=16),m(t.exports.meshopt_encodeFilterQuat,b,_,p,v,16)},encodeFilterExp:function(b,_,p,v,u){s(p>0&&p%4==0),s(v>=1&&v<=24);var S={Separate:0,SharedVector:1,SharedComponent:2};return m(t.exports.meshopt_encodeFilterExp,b,_,p,v,p,u?S[u]:1)}}})(),_a=(function(){var n="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q;iekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq;w8Wqdbk;esezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9Uc;WFbGgocjdaocjd6EhDaicefhocbhqdnindndndnaeaq9nmbaDaeaq9RaqaDfae6Egkcsfglcl4cifcd4hxalc9WGgmTmecbhPawcjdfhsaohzinaraz9Rax6mvarazaxfgo9RcK6mvczhlcbhHinalgic9WfgOawcj;cbffhldndndndndnazaOco4fRbbaHcoG4ciGPlbedibkal9cb83ibalcwf9cb83ibxikalaoRblaoRbbgOco4gAaAciSgAE86bbawcj;cbfaifglcGfaoclfaAfgARbbaOcl4ciGgCaCciSgCE86bbalcVfaAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc7faAaCfgARbbaOciGgOaOciSgOE86bbalctfaAaOfgARbbaoRbegOco4gCaCciSgCE86bbalc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc93faAaCfgARbbaOciGgOaOciSgOE86bbalc94faAaOfgARbbaoRbdgOco4gCaCciSgCE86bbalc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc97faAaCfgARbbaOciGgOaOciSgOE86bbalc98faAaOfgORbbaoRbigoco4gAaAciSgAE86bbalc99faOaAfgORbbaocl4ciGgAaAciSgAE86bbalc9:faOaAfgORbbaocd4ciGgAaAciSgAE86bbalcufaOaAfglRbbaociGgoaociSgoE86bbalaofhoxdkalaoRbwaoRbbgOcl4gAaAcsSgAE86bbawcj;cbfaifglcGfaocwfaAfgARbbaOcsGgOaOcsSgOE86bbalcVfaAaOfgORbbaoRbegAcl4gCaCcsSgCE86bbalc7faOaCfgORbbaAcsGgAaAcsSgAE86bbalctfaOaAfgORbbaoRbdgAcl4gCaCcsSgCE86bbalc91faOaCfgORbbaAcsGgAaAcsSgAE86bbalc4faOaAfgORbbaoRbigAcl4gCaCcsSgCE86bbalc93faOaCfgORbbaAcsGgAaAcsSgAE86bbalc94faOaAfgORbbaoRblgAcl4gCaCcsSgCE86bbalc95faOaCfgORbbaAcsGgAaAcsSgAE86bbalc96faOaAfgORbbaoRbvgAcl4gCaCcsSgCE86bbalc97faOaCfgORbbaAcsGgAaAcsSgAE86bbalc98faOaAfgORbbaoRbogAcl4gCaCcsSgCE86bbalc99faOaCfgORbbaAcsGgAaAcsSgAE86bbalc9:faOaAfgORbbaoRbrgocl4gAaAcsSgAE86bbalcufaOaAfglRbbaocsGgoaocsSgoE86bbalaofhoxekalao8Pbb83bbalcwfaocwf8Pbb83bbaoczfhokdnaiam9pmbaHcdfhHaiczfhlarao9RcL0mekkaiam6mvaoTmvdnakTmbawaPfRbbhHawcj;cbfhlashiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkkascefhsaohzaPcefgPad9hmbxikkcbc99arao9Radcaadca0ESEhoxlkaoaxad2fhCdnakmbadhlinaoTmlarao9Rax6mlaoaxfhoalcufglmbkaChoxekcbhmawcjdfhAinarao9Rax6miawamfRbbhHawcj;cbfhlaAhiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkaAcefhAaoaxfhoamcefgmad9hmbkaChokabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqaombkc9:hoxekc9:hokavcj;ebf8Kjjjjbaok;cseHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;oiliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabaiavcefciGfcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavciGfgkcd7cetfaD87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavcufciGfcetfaD87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohvxekcjjjj94hvkabakcetfav87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklz9Kbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q;Aekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq:p9sqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk:N8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhlaicefhodnaeTmbadTmbalc;WFbGglcjdalcjd6EhwcbhDinawaeaD9RaDawfae6Egqcsfglc9WGgkci2hxakcethmalcl4cifcd4hPabaDad2fhsakc;ab6hzcbhHincbhOaohAdndninaraA9RaP6meavcj;cbfaOak2fhCaAaPfhocbhidnazmbarao9Rc;Gb6mbcbhlinaCalfhidndndndndnaAalco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklbaoczfhokdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklzaoczfhokdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklaaoczfhokdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaoclfaYpQbfaXc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaocwfaYpQbfaXc:q:yjjbfRbbfhoxekaiaopbbbpkl8Waoczfhokalc;abfhialcjefak0meaihlarao9Rc;Fb0mbkkdnaiak9pmbaici4hlinarao9RcK6miaCaifhXdndndndndnaAaico4fRbbalcoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpkbbxikaXaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaXaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaXaopbbbpkbbaoczfhokalcdfhlaiczfgiak6mbkkaoTmeaohAaOcefgOclSmdxbkkc9:hoxlkdnakTmbavcjdfaHfhiavaHfpbdbhYcbhXinaiavcj;cbfaXfglpblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLalakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEalamfpblbg3cep9Ta3aQp9op9Hp9rg3alaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfhiaXczfgXak6mbkkaHclfgHad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfgDae6mbkkcbc99arao9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk::seHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:wPliuo97eue978Jjjjjbca9Rhiaec98Ghldndnadcl9hmbdnalTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalaeSmeaipxbbbbbbbbbbbbbbbbgqpklbaiabalcdtfgdaeciGglcdtgv;8qbbdnalTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDaqp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkadaiav;8qbbskdnalTmbcbhvabhdinadczfgxaxpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oaoarpmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgval6mbkkalaeSmbaiaeciGgvcitgdfcbcaad9R;8kbaiabalcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oaoarpmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalaeSmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbheabhdinadadpbbbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbadczfhdaeclfgeav6mbkkdnavalSmbaialciGgecdtgdVcbc;abad9R;8kbaiabavcdtfgvad;8qbbdnaeTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepklbkavaiad;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz9Tbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),a=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var r=WebAssembly.validate(t)?o(e):o(n),s,i=WebAssembly.instantiate(r,{}).then(function(u){s=u.instance,s.exports.__wasm_call_ctors()});function o(u){for(var S=new Uint8Array(u.length),g=0;g<u.length;++g){var x=u.charCodeAt(g);S[g]=x>96?x-97:x>64?x-39:x+4}for(var T=0,g=0;g<u.length;++g)S[T++]=S[g]<60?a[S[g]]:(S[g]-60)*64+S[++g];return S.buffer.slice(0,T)}function l(u,S,g,x,T,C,f){var w=u.exports.sbrk,R=x+3&-4,I=w(R*T),D=w(C.length),M=new Uint8Array(u.exports.memory.buffer);M.set(C,D);var A=S(I,x,T,D,C.length);if(A==0&&f&&f(I,R,T),g.set(M.subarray(I,I+x*T)),w(I-w(0)),A!=0)throw new Error("Malformed buffer data: "+A)}var c={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},h={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},d=[],m=0;function b(u){var S={object:new Worker(u),pending:0,requests:{}};return S.object.onmessage=function(g){var x=g.data;S.pending-=x.count,S.requests[x.id][x.action](x.value),delete S.requests[x.id]},S}function _(u){for(var S="self.ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(r)+"]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = "+v.name+";"+l.toString()+v.toString(),g=new Blob([S],{type:"text/javascript"}),x=URL.createObjectURL(g),T=d.length;T<u;++T)d[T]=b(x);for(var T=u;T<d.length;++T)d[T].object.postMessage({});d.length=u,URL.revokeObjectURL(x)}function p(u,S,g,x,T){for(var C=d[0],f=1;f<d.length;++f)d[f].pending<C.pending&&(C=d[f]);return new Promise(function(w,R){var I=new Uint8Array(g),D=++m;C.pending+=u,C.requests[D]={resolve:w,reject:R},C.object.postMessage({id:D,count:u,size:S,source:I,mode:x,filter:T},[I.buffer])})}function v(u){var S=u.data;if(!S.id)return self.close();self.ready.then(function(g){try{var x=new Uint8Array(S.count*S.size);l(g,g.exports[S.mode],x,S.count,S.size,S.source,g.exports[S.filter]),self.postMessage({id:S.id,count:S.count,action:"resolve",value:x},[x.buffer])}catch(T){self.postMessage({id:S.id,count:S.count,action:"reject",value:T})}})}return{ready:i,supported:!0,useWorkers:function(u){_(u)},decodeVertexBuffer:function(u,S,g,x,T){l(s,s.exports.meshopt_decodeVertexBuffer,u,S,g,x,s.exports[c[T]])},decodeIndexBuffer:function(u,S,g,x){l(s,s.exports.meshopt_decodeIndexBuffer,u,S,g,x)},decodeIndexSequence:function(u,S,g,x){l(s,s.exports.meshopt_decodeIndexSequence,u,S,g,x)},decodeGltfBuffer:function(u,S,g,x,T,C){l(s,s.exports[h[T]],u,S,g,x,s.exports[c[C]])},decodeGltfBufferAsync:function(u,S,g,x,T){return d.length>0?p(u,S,g,h[x],c[T]):i.then(function(){var C=new Uint8Array(u*S);return l(s,s.exports[h[x]],C,u,S,g,s.exports[c[T]]),C})}}})();(function(){var n="b9H79Tebbbe9Hk9Geueu9Geub9Gbb9Gsuuuuuuuuuuuu99uueu9Gvuuuuub9Gvuuuuue999Gquuuuuuu99uueu9Gwuuuuuu99ueu9Giuuue999Gluuuueu9GiuuueuizsdilvoirwDbqqbeqlve9Weiiviebeoweuecj;jekr:Tewo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bbz9TW79O9V9Wt9F79P9T9W29P9M95bl8E9TW79O9V9Wt9F79P9T9W29P9M959x9Pt9OcttV9P9I91tW7bvQ9TW79O9V9Wt9F79P9T9W29P9M959q9V9P9Ut7boX9TW79O9V9Wt9F79P9T9W29P9M959t9J9H2Wbra9TW79O9V9Wt9F9V9Wt9P9T9P96W9wWVtW94SWt9J9O9sW9T9H9Wbwl79IV9RbDDwebcekdmxq:f97sdbk:39si8Au8A99zu8Jjjjjbc;W;ab9Rgs8Kjjjjbcbhzascxfcbc;Kbz:ljjjb8AdnabaeSmbabaeadcdtz:kjjjb8AkdndnamcdGmbcbhHxekasalcrfci4gecbyd;S1jjbHjjjjbbgOBdxasceBd2aOcbaez:ljjjbhAcbhlcbhednadTmbcbhlabheadhOinaAaeydbgCci4fgXaXRbbgXceaCcrGgCtV86bbaXcu7aC4ceGalfhlaeclfheaOcufgOmbkcualcdtalcFFFFi0Ehekasaecbyd;S1jjbHjjjjbbgHBdzascdBd2alcd4alfhCcehOinaOgecethOaeaC6mbkcdhzcbhQascuaecdtgOaecFFFFi0Ecbyd;S1jjbHjjjjbbgCBdCasciBd2aCcFeaOz:ljjjbhLdnadTmbaecufhXcbhKinabaQcdtfgYydbgAc:v;t;h;Ev2hCcbhedndninaLaCaXGgCcdtfg8AydbgOcuSmeaHaOcdtfydbaASmdaecefgeaCfhCaeaX9nmbxdkkaHaKcdtfaABdba8AaKBdbaKhOaKcefhKkaYaOBdbaQcefgQad9hmbkkaLcbyd;O1jjbH:bjjjbbascdBd2kascxfazcdtfcualcefgecdtaecFFFFi0Ecbyd;S1jjbHjjjjbbgEBdbasaEBdlasazceVgeBd2ascxfaecdtfcuadcitadcFFFFe0Ecbyd;S1jjbHjjjjbbg3Bdbasa3BdwasazcdfgeBd2asclfabadalcbz:cjjjbascxfaecdtfcualcdtg5alcFFFFi0Eg8Ecbyd;S1jjbHjjjjbbgOBdbasazcifgeBd2ascxfaecdtfa8Ecbyd;S1jjbHjjjjbbg8FBdbasazclVgaBd2alcd4alfhXcehCinaCgecethCaeaX6mbkcbhKascxfaacdtfghcuaecdtgCaecFFFFi0Ecbyd;S1jjbHjjjjbbgXBdbasazcvVggBd2aXcFeaCz:ljjjbhQdnalTmbavcd4hAaecufhCinaKhednaHTmbaHaKcdtfydbhekaiaeaA2cdtfgeydlgXcH4aX7c:F:b:DD2aeydbgXcH4aX7c;D;O:B8J27aeydwgecH4ae7c:3F;N8N27aCGheaKcdth8JdndndndndnaHTmbaHa8JfhYcbhXinaQaecdtfgLydbg8AcuSmlaiaHa8AcdtfydbaA2cdtfaiaYydbaA2cdtfcxz:ojjjbTmiaXcefgXaefaCGheaXaC9nmbxdkkaiaKaA2cdtfhYcbhXinaQaecdtfgLydbg8AcuSmiaia8AaA2cdtfaYcxz:ojjjbTmdaXcefgXaefaCGheaXaC9nmbkkcbhLkaLydbgecu9hmekaLaKBdbaKhekaOa8JfaeBdbaKcefgKal9hmbkcbhea8FhCinaCaeBdbaCclfhCalaecefge9hmbkcbheaOhCa8FhXindnaeaCydbgASmbaXa8FaAcdtfgAydbBdbaAaeBdbkaCclfhCaXclfhXalaecefge9hmbkkcbh8KaQcbyd;O1jjbH:bjjjbbasaaBd2ahalcbyd;S1jjbHjjjjbbgABdbasagBd2ascxfagcdtfa8Ecbyd;S1jjbHjjjjbbgeBdbasazcofgCBd2ascxfaCcdtfa8Ecbyd;S1jjbHjjjjbbgCBdbasazcrfg8LBd2aecFea5z:ljjjbh8MaCcFea5z:ljjjbh8NdnalTmba3cwfhyindnaEa8KgXcefg8Kcdtfydbg8AaEaXcdtgefydbgCSmba8AaC9Rh8Ja3aCcitfh5a8Naefhga8MaefhKcbhLindndna5aLcitfydbgQaX9hmbaKaXBdbagaXBdbxekdnaEaQcdtgafgeclfydbgCaeydbgeSmba3aecitg8AfydbaXSmeaCae9Rhhaecu7aCfhYaya8AfhCcbheinaYaeSmeaecefheaCydbh8AaCcwfhCa8AaX9hmbkaeah6meka8NaafgeaXaQaeydbcuSEBdbaKaQaXaKydbcuSEBdbkaLcefgLa8J9hmbkka8Kal9hmbkaOhCaHhLa8FhXa8Nh8Aa8MhQcbheindndnaeaCydbgY9hmbdnaqTmbaehYdnaHTmbaLydbhYkaqaYfRbbTmbaAaefcl86bbxdkdnaeaXydbgY9hmbaQydbhYdna8AydbgKcu9hmbaYcu9hmbaAaefcb86bbxikaAaefh8JdnaeaKSmbaeaYSmba8Jce86bbxika8Jcl86bbxdkdnaea8FaYcdtgKfydb9hmbdna8Aydbg8JcuSmbaea8JSmbaQydbg5cuSmbaea5Smba8NaKfydbgacuSmbaaaYSmba8MaKfydbgKcuSmbaKaYSmbdnaOa8JcdtfydbaOaKcdtfydb9hmbaOa5cdtfydbaOaacdtfydb9hmbaAaefcd86bbxlkaAaefcl86bbxikaAaefcl86bbxdkaAaefcl86bbxekaAaefaAaYfRbb86bbkaCclfhCaLclfhLaXclfhXa8Aclfh8AaQclfhQalaecefge9hmbkamceGTmbaAhealhCindnaeRbbce9hmbaecl86bbkaecefheaCcufgCmbkkascxfa8Lcdtfcualcx2alc;v:Q;v:Qe0Ecbyd;S1jjbHjjjjbbggBdbasazcwVg8JBd2agaialavaHz:djjjbh8PdndnaDmbcbhvxekascxfa8JcdtfcualaD2gecdtaecFFFFi0Ecbyd;S1jjbHjjjjbbgvBdbasazcDVg8JBd2alTmbarcd4hYdnaHTmbaDcdthKcbhLavhQinaoaHaLcdtfydbaY2cdtfheawhCaQhXaDh8AinaXaeIdbaCIdbNUdbaeclfheaCclfhCaXclfhXa8Acufg8AmbkaQaKfhQaLcefgLal9hmbxdkkaYcdthYaDcdthKcbhQavhLinaoheawhCaLhXaDh8AinaXaeIdbaCIdbNUdbaeclfheaCclfhCaXclfhXa8Acufg8AmbkaoaYfhoaLaKfhLaQcefgQal9hmbkkascxfa8Jcdtfcualc8S2gealc;D;O;f8U0EgXcbyd;S1jjbHjjjjbbgCBdbasa8Jcefg8ABd2aCcbaez:ljjjbh8KdndndnaDTmbascxfa8AcdtfaXcbyd;S1jjbHjjjjbbgqBdbasa8JcdfgCBd2aqcbaez:ljjjb8AascxfaCcdtfcualaD2gecltgCaecFFFFb0Ecbyd;S1jjbHjjjjbbgwBdbasa8JcifBd2awcbaCz:ljjjb8AadmexdkcbhqcbhwadTmekcbhLabhCindnagaCclfydbgQcx2fgeIdbagaCydbgYcx2fgXIdbgI:tg8RagaCcwfydbgKcx2fg8AIdlaXIdlg8S:tgRNa8AIdbaI:tg8UaeIdla8S:tg8VN:tg8Wa8WNa8Va8AIdwaXIdwg8X:tg8YNaRaeIdwa8X:tg8VN:tgRaRNa8Va8UNa8Ya8RN:tg8Ra8RNMM:rg8UJbbbb9ETmba8Wa8U:vh8Wa8Ra8U:vh8RaRa8U:vhRka8KaOaYcdtfydbc8S2fgeaRa8U:rg8UaRNNg8VaeIdbMUdbaea8Ra8Ua8RNg8ZNg8YaeIdlMUdlaea8Wa8Ua8WNg80Ng81aeIdwMUdwaea8ZaRNg8ZaeIdxMUdxaea80aRNgBaeIdzMUdzaea80a8RNg80aeIdCMUdCaeaRa8Ua8Wa8XNaRaINa8Sa8RNMM:mg8SNgINgRaeIdKMUdKaea8RaINg8RaeId3MUd3aea8WaINg8WaeIdaMUdaaeaIa8SNgIaeId8KMUd8Kaea8UaeIdyMUdya8KaOaQcdtfydbc8S2fgea8VaeIdbMUdbaea8YaeIdlMUdlaea81aeIdwMUdwaea8ZaeIdxMUdxaeaBaeIdzMUdzaea80aeIdCMUdCaeaRaeIdKMUdKaea8RaeId3MUd3aea8WaeIdaMUdaaeaIaeId8KMUd8Kaea8UaeIdyMUdya8KaOaKcdtfydbc8S2fgea8VaeIdbMUdbaea8YaeIdlMUdlaea81aeIdwMUdwaea8ZaeIdxMUdxaeaBaeIdzMUdzaea80aeIdCMUdCaeaRaeIdKMUdKaea8RaeId3MUd3aea8WaeIdaMUdaaeaIaeId8KMUd8Kaea8UaeIdyMUdyaCcxfhCaLcifgLad6mbkcbh8JabhYinaba8JcdtfhQcbhCinaAaQaCcj1jjbfydbcdtfydbgXfRbbhedndnaAaYaCfydbg8AfRbbgLc99fcFeGcpe0mbaeceSmbaecd9hmekdnaLcufcFeGce0mba8Ma8AcdtfydbaX9hmekdnaecufcFeGce0mba8NaXcdtfydba8A9hmekdnaLcv2aefc:q1jjbfRbbTmbaOaXcdtfydbaOa8Acdtfydb0mekdnagaXcx2fgKIdwaga8Acx2fgiIdwg8S:tgRaRNaKIdbaiIdbg8X:tg8Ra8RNaKIdlaiIdlg8V:tg8Ua8UNMM:rgIJbbbb9ETmbaRaI:vhRa8UaI:vh8Ua8RaI:vh8RkJbbacJbbacJbbjZaeceSEaLceSEh80dnagaQaCc:e1jjbfydbcdtfydbcx2fgeIdwa8S:tg8WaRa8WaRNaeIdba8X:tg81a8RNa8UaeIdla8V:tg8ZNMMg8YN:tg8Wa8WNa81a8Ra8YN:tgRaRNa8Za8Ua8YN:tg8Ra8RNMM:rg8UJbbbb9ETmba8Wa8U:vh8Wa8Ra8U:vh8RaRa8U:vhRka8KaOa8Acdtfydbc8S2fgeaRa80aINg8UaRNNg8YaeIdbMUdbaea8Ra8Ua8RNg80Ng81aeIdlMUdlaea8Wa8Ua8WNgINg8ZaeIdwMUdwaea80aRNg80aeIdxMUdxaeaIaRNgBaeIdzMUdzaeaIa8RNg83aeIdCMUdCaeaRa8Ua8Wa8SNaRa8XNa8Va8RNMM:mg8SNgINgRaeIdKMUdKaea8RaINg8RaeId3MUd3aea8WaINg8WaeIdaMUdaaeaIa8SNgIaeId8KMUd8Kaea8UaeIdyMUdya8KaOaXcdtfydbc8S2fgea8YaeIdbMUdbaea81aeIdlMUdlaea8ZaeIdwMUdwaea80aeIdxMUdxaeaBaeIdzMUdzaea83aeIdCMUdCaeaRaeIdKMUdKaea8RaeId3MUd3aea8WaeIdaMUdaaeaIaeId8KMUd8Kaea8UaeIdyMUdykaCclfgCcx9hmbkaYcxfhYa8Jcifg8Jad6mbkaDTmbcbhYinJbbbbh8XagabaYcdtfgeclfydbgKcx2fgCIdwagaeydbgicx2fgXIdwg8Z:tg8Ra8RNaCIdbaXIdbgB:tg8Wa8WNaCIdlaXIdlg83:tg8Ua8UNMMg80agaecwfydbg8Jcx2fgeIdwa8Z:tgINa8Ra8RaINa8WaeIdbaB:tg8SNa8UaeIdla83:tg8VNMMgRN:tJbbbbJbbjZa80aIaINa8Sa8SNa8Va8VNMMg81NaRaRN:tg8Y:va8YJbbbb9BEg8YNhUa81a8RNaIaRN:ta8YNh85a80a8VNa8UaRN:ta8YNh86a81a8UNa8VaRN:ta8YNh87a80a8SNa8WaRN:ta8YNh88a81a8WNa8SaRN:ta8YNh89a8Wa8VNa8Sa8UN:tgRaRNa8UaINa8Va8RN:tgRaRNa8Ra8SNaIa8WN:tgRaRNMM:r:rhRavaiaD2cdtfhCava8JaD2cdtfhXavaKaD2cdtfh8Aa8Z:mh8:a83:mhZaB:mhncbhLaDhQJbbbbh8VJbbbbh8YJbbbbh80Jbbbbh81Jbbbbh8ZJbbbbhBJbbbbh83JbbbbhcJbbbbh9cinasc;WbfaLfgecwfaRa85a8AIdbaCIdbgI:tg8UNaUaXIdbaI:tg8SNMg8RNUdbaeclfaRa87a8UNa86a8SNMg8WNUdbaeaRa89a8UNa88a8SNMg8UNUdbaecxfaRa8:a8RNaZa8WNaIana8UNMMMgINUdbaRa8Ra8WNNa81Mh81aRa8Ra8UNNa8ZMh8ZaRa8Wa8UNNaBMhBaRaIaINNa8XMh8XaRa8RaINNa8VMh8VaRa8WaINNa8YMh8YaRa8UaINNa80Mh80aRa8Ra8RNNa83Mh83aRa8Wa8WNNacMhcaRa8Ua8UNNa9cMh9caCclfhCa8Aclfh8AaXclfhXaLczfhLaQcufgQmbkaqaOaicdtfydbgCc8S2fgea9caeIdbMUdbaeacaeIdlMUdlaea83aeIdwMUdwaeaBaeIdxMUdxaea8ZaeIdzMUdzaea81aeIdCMUdCaea80aeIdKMUdKaea8YaeId3MUd3aea8VaeIdaMUdaaea8XaeId8KMUd8KaeaRaeIdyMUdyaqaOaKcdtfydbgKc8S2fgea9caeIdbMUdbaeacaeIdlMUdlaea83aeIdwMUdwaeaBaeIdxMUdxaea8ZaeIdzMUdzaea81aeIdCMUdCaea80aeIdKMUdKaea8YaeId3MUd3aea8VaeIdaMUdaaea8XaeId8KMUd8KaeaRaeIdyMUdyaqaOa8Jcdtfydbgic8S2fgea9caeIdbMUdbaeacaeIdlMUdlaea83aeIdwMUdwaeaBaeIdxMUdxaea8ZaeIdzMUdzaea81aeIdCMUdCaea80aeIdKMUdKaea8YaeId3MUd3aea8VaeIdaMUdaaea8XaeId8KMUd8KaeaRaeIdyMUdyawaCaD2cltfhQcbhCaDh8AinaQaCfgeasc;WbfaCfgXIdbaeIdbMUdbaeclfgLaXclfIdbaLIdbMUdbaecwfgLaXcwfIdbaLIdbMUdbaecxfgeaXcxfIdbaeIdbMUdbaCczfhCa8Acufg8AmbkawaKaD2cltfhQcbhCaDh8AinaQaCfgeasc;WbfaCfgXIdbaeIdbMUdbaeclfgLaXclfIdbaLIdbMUdbaecwfgLaXcwfIdbaLIdbMUdbaecxfgeaXcxfIdbaeIdbMUdbaCczfhCa8Acufg8AmbkawaiaD2cltfhQcbhCaDh8AinaQaCfgeasc;WbfaCfgXIdbaeIdbMUdbaeclfgLaXclfIdbaLIdbMUdbaecwfgLaXcwfIdbaLIdbMUdbaecxfgeaXcxfIdbaeIdbMUdbaCczfhCa8Acufg8AmbkaYcifgYad6mbkkasydlhJcbhednalTmbaJclfheaJydbh8AaAhCalhLcbhXincbaeydbgQa8A9RaCRbbcpeGEaXfhXaCcefhCaeclfheaQh8AaLcufgLmbkaXce4hekcuadae9Rcifg8Lcx2a8Lc;v:Q;v:Qe0Ecbyd;S1jjbHjjjjbbhhascxfasyd2gecdtfahBdbasaecefgCBd2ascxfaCcdtfcua8Lcdta8LcFFFFi0Ecbyd;S1jjbHjjjjbbgzBdbasaecdfgCBd2ascxfaCcdtfa8Ecbyd;S1jjbHjjjjbbg3BdbasaecifgCBd2ascxfaCcdtfalcbyd;S1jjbHjjjjbbg9eBdbasaeclfBd2a8PJbbjZamclGEhcJbbbbh83dnadak9nmbdna8Lci6mbaxaxNacacN:vhBaDclthTahcwfhSJbbbbh83inasclfabadgoalaOz:cjjjbabhicbhEcbhyinabaycdtfh8JcbheindnaOaiaefydbgXcdtgKfydbg8AaOa8Jaec:S1jjbfydbcdtfydbgCcdtfydbgLSmbaAaCfRbbgYcv2aAaXfRbbgQfc;a1jjbfRbbgaaQcv2aYfg5c;a1jjbfRbbgdVcFeGTmbdnaLa8A9nmba5c:q1jjbfRbbcFeGmekdnaQaY9hmbaQcufcFeGce0mba8MaKfydbaC9hmekahaEcx2fg8AaCaXadcFeGgLEBdla8AaXaCaLEBdba8AaLaaGcb9hBdwaEcefhEkaeclfgecx9hmbkdnaycifgyao9pmbaicxfhiaEcifa8L9nmekkdnaEmbaohdxikcbhYinJbbbbJbbjZa8KaOahaYcx2fg8AydlgLa8AydbgQa8AydwgCEgicdtfydbgac8S2gdfgeIdygR:vaRJbbbb9BEaeIdwagaQaLaCEgKcx2fgCIdwg8UNaeIdzaCIdbgINaeIdaMgRaRMMa8UNaeIdlaCIdlg8SNaeIdCa8UNaeId3MgRaRMMa8SNaeIdbaINaeIdxa8SNaeIdKMgRaRMMaINaeId8KMMM:lNh80JbbbbJbbjZa8KaOaQcdtfydbgyc8S2gXfgeIdygR:vaRJbbbb9BEaeIdwagaLcx2fgCIdwg8WNaeIdzaCIdbg8XNaeIdaMgRaRMMa8WNaeIdlaCIdlg8VNaeIdCa8WNaeId3MgRaRMMa8VNaeIdba8XNaeIdxa8VNaeIdKMgRaRMMa8XNaeId8KMMM:lNh81a8Acwfh8Ja8Aclfh5dnaDTmbaqaXfgXIdwa8WNaXIdza8XNaXIdaMgRaRMMa8WNaXIdla8VNaXIdCa8WNaXId3MgRaRMMa8VNaXIdba8XNaXIdxa8VNaXIdKMgRaRMMa8XNaXId8KMMMh8RavaLaD2cdtfhCawayaD2cltfheaXIdyh8YaDhXinaCIdbgRJbbb;aNaecxfIdba8WaecwfIdbNa8XaeIdbNa8VaeclfIdbNMMMNaRaRNa8YNa8RMMh8RaCclfhCaeczfheaXcufgXmbkaqadfgXIdwa8UNaXIdzaINaXIdaMgRaRMMa8UNaXIdla8SNaXIdCa8UNaXId3MgRaRMMa8SNaXIdbaINaXIdxa8SNaXIdKMgRaRMMaINaXId8KMMMh8WavaKaD2cdtfhCawaaaD2cltfheaXIdyh8XaDhXinaCIdbgRJbbb;aNaecxfIdba8UaecwfIdbNaIaeIdbNa8SaeclfIdbNMMMNaRaRNa8XNa8WMMh8WaCclfhCaeczfheaXcufgXmbka80a8W:lMh80a81a8R:lMh81ka5aLaKa81a809FgeEBdba8AaQaiaeEBdba8Ja81a80aeEUdbaYcefgYaE9hmbkasc;Wbfcbcj;abz:ljjjb8AaSheaEhCinasc;WbfaeydbcO4c;8ZGfgXaXydbcefBdbaecxfheaCcufgCmbkcbhecbhCinasc;WbfaefgXydbh8AaXaCBdba8AaCfhCaeclfgecj;ab9hmbkcbheaShCinasc;WbfaCydbcO4c;8ZGfgXaXydbgXcefBdbazaXcdtfaeBdbaCcxfhCaEaecefge9hmbkaoak9RgXci9Uh9hdnalTmbcbhea3hCinaCaeBdbaCclfhCalaecefge9hmbkkcbh9ia9ecbalz:ljjjbh6aXcO9Uh9ka9hce4h0asydwh9mcbhdcbh5dninahaza5cdtfydbcx2fg8JIdwg8RaB9Emeada9h9pmeJFFuuhRdna0aE9pmbahaza0cdtfydbcx2fIdwJbb;aZNhRkdna8RaR9ETmbada9k0mdkdna6aOa8Jydlg9ncdtg9ofydbg8Afg9pRbba6aOa8Jydbgicdtg9qfydbg9rfg9sRbbVmbdnaJa9rcdtfgeclfydbgCaeydbgeSmbaCae9RhQa9maecitfheaga8Acx2fgKcwfhyaKclfh8Eaga9rcx2fgacwfhmaaclfhrcbhCcehYdnindna3aeydbcdtfydbgXa8ASmba3aeclfydbcdtfydbgLa8ASmbaXaLSmbagaLcx2fgLIdbagaXcx2fgXIdbg8W:tgRarIdbaXIdlg8U:tg8XNaaIdba8W:tg8VaLIdla8U:tg8RN:tgIaRa8EIdba8U:tg8YNaKIdba8W:tg80a8RN:tg8UNa8RamIdbaXIdwg8S:tg81Na8XaLIdwa8S:tg8WN:tg8Xa8RayIdba8S:tg8ZNa8Ya8WN:tg8RNa8Wa8VNa81aRN:tg8Sa8Wa80Na8ZaRN:tgRNMMaIaINa8Xa8XNa8Sa8SNMMa8Ua8UNa8Ra8RNaRaRNMMN:rJbbj8:N9FmdkaecwfheaCcefgCaQ6hYaQaC9hmbkkaYceGTmba0cefh0xeka8Ka8Ac8S2gXfgea8Ka9rc8S2gLfgCIdbaeIdbMUdbaeaCIdlaeIdlMUdlaeaCIdwaeIdwMUdwaeaCIdxaeIdxMUdxaeaCIdzaeIdzMUdzaeaCIdCaeIdCMUdCaeaCIdKaeIdKMUdKaeaCId3aeId3MUd3aeaCIdaaeIdaMUdaaeaCId8KaeId8KMUd8KaeaCIdyaeIdyMUdydnaDTmbaqaXfgeaqaLfgCIdbaeIdbMUdbaeaCIdlaeIdlMUdlaeaCIdwaeIdwMUdwaeaCIdxaeIdxMUdxaeaCIdzaeIdzMUdzaeaCIdCaeIdCMUdCaeaCIdKaeIdKMUdKaeaCId3aeId3MUd3aeaCIdaaeIdaMUdaaeaCId8KaeId8KMUd8KaeaCIdyaeIdyMUdyaTa9r2hYaTa8A2hKawhCaDhLinaCaKfgeaCaYfgXIdbaeIdbMUdbaeclfgQaXclfIdbaQIdbMUdbaecwfgQaXcwfIdbaQIdbMUdbaecxfgeaXcxfIdbaeIdbMUdbaCczfhCaLcufgLmbkka8JcwfhCdndndndnaAaifgXRbbc9:fPdebdkaiheina3aecdtgefa8ABdba8Faefydbgeai9hmbxikka8Fa9ofydbhea8Fa9qfydbhia3a9qfa9nBdbaeh9nka3aicdtfa9nBdbka9sce86bba9pce86bbaCIdbgRa83a83aR9DEh83a9icefh9icecdaXRbbceSEadfhdka5cefg5aE9hmbkkdna9imbaohdxikdnalTmbcbhCa8MheindnaeydbgXcuSmbdnaCa3aXcdtg8AfydbgX9hmba8Ma8AfydbhXkaeaXBdbkaeclfhealaCcefgC9hmbkcbhCa8NheindnaeydbgXcuSmbdnaCa3aXcdtg8AfydbgX9hmba8Na8AfydbhXkaeaXBdbkaeclfhealaCcefgC9hmbkkcbhdabhecbhLindna3aeydbcdtfydbgCa3aeclfydbcdtfydbgXSmbaCa3aecwfydbcdtfydbg8ASmbaXa8ASmbabadcdtfgQaCBdbaQcwfa8ABdbaQclfaXBdbadcifhdkaecxfheaLcifgLao6mbkadak9nmdxbkkasclfabadalaOz:cjjjbkdnaHTmbadTmbadheinabaHabydbcdtfydbBdbabclfhbaecufgembkkdnaPTmbaPaca83:rNUdbkasyd2gecdtascxffc98fhOdninaeTmeaOydbcbyd;O1jjbH:bjjjbbaOc98fhOaecufhexbkkasc;W;abf8Kjjjjbadk;Yieouabydlhvabydbclfcbaicdtz:ljjjbhoadci9UhrdnadTmbdnalTmbaehwadhDinaoalawydbcdtfydbcdtfgqaqydbcefBdbawclfhwaDcufgDmbxdkkaehwadhDinaoawydbcdtfgqaqydbcefBdbawclfhwaDcufgDmbkkdnaiTmbcbhDaohwinawydbhqawaDBdbawclfhwaqaDfhDaicufgimbkkdnadci6mbinaecwfydbhwaeclfydbhDaeydbhidnalTmbalawcdtfydbhwalaDcdtfydbhDalaicdtfydbhikavaoaicdtfgqydbcitfaDBdbavaqydbcitfawBdlaqaqydbcefBdbavaoaDcdtfgqydbcitfawBdbavaqydbcitfaiBdlaqaqydbcefBdbavaoawcdtfgwydbcitfaiBdbavawydbcitfaDBdlawawydbcefBdbaecxfhearcufgrmbkkabydbcbBdbk;Podvuv998Jjjjjbca9RgvcFFF;7rBd3av9cFFF;7;3FF:;Fb83dCavcFFF97Bdzav9cFFF;7FFF:;u83dwdnadTmbaicd4hodnabmbdnalTmbcbhrinaealarcdtfydbao2cdtfhwcbhiinavcCfaifgDawaifIdbgqaDIdbgkakaq9EEUdbavcwfaifgDaqaDIdbgkakaq9DEUdbaiclfgicx9hmbkarcefgrad9hmbxikkaocdthrcbhwincbhiinavcCfaifgDaeaifIdbgqaDIdbgkakaq9EEUdbavcwfaifgDaqaDIdbgkakaq9DEUdbaiclfgicx9hmbkaearfheawcefgwad9hmbxdkkdnalTmbcbhrinabarcx2fgiaealarcdtfydbao2cdtfgwIdbUdbaiawIdlUdlaiawIdwUdwcbhiinavcCfaifgDawaifIdbgqaDIdbgkakaq9EEUdbavcwfaifgDaqaDIdbgkakaq9DEUdbaiclfgicx9hmbkarcefgrad9hmbxdkkaocdthlcbhraehwinabarcx2fgiaearao2cdtfgDIdbUdbaiaDIdlUdlaiaDIdwUdwcbhiinavcCfaifgDawaifIdbgqaDIdbgkakaq9EEUdbavcwfaifgDaqaDIdbgkakaq9DEUdbaiclfgicx9hmbkawalfhwarcefgrad9hmbkkJbbbbavIdwavIdCgk:tgqaqJbbbb9DEgqavIdxavIdKgx:tgmamaq9DEgqavIdzavId3gm:tgPaPaq9DEhPdnabTmbadTmbJbbbbJbbjZaP:vaPJbbbb9BEhqinabaqabIdbak:tNUdbabclfgvaqavIdbax:tNUdbabcwfgvaqavIdbam:tNUdbabcxfhbadcufgdmbkkaPk8MbabaeadaialavcbcbcbcbcbaoarawaDz:bjjjbk8MbabaeadaialavaoarawaDaqakaxamaPz:bjjjbk;3Aowud99wue99iul998Jjjjjbc;Wb9Rgw8KjjjjbdndnarmbcbhDxekawcxfcbc;Kbz:ljjjb8Aawcuadcx2adc;v:Q;v:Qe0Ecbyd;S1jjbHjjjjbbgqBdxawceBd2aqaeadaicbz:djjjb8AawcuadcdtadcFFFFi0Egkcbyd;S1jjbHjjjjbbgxBdzawcdBd2adcd4adfhmceheinaegicetheaiam6mbkcbhmawcuaicdtgPaicFFFFi0Ecbyd;S1jjbHjjjjbbgsBdCawciBd2dndnar:Zgz:rJbbbZMgH:lJbbb9p9DTmbaH:Ohexekcjjjj94hekaicufhOc:bwhAcbhCcbhXadhQinaChLaeaAgKcufaeaK9iEamgDcefaeaD9kEhYdndnadTmbaYcuf:YhHaqhiaxheadhmindndnaiIdbaHNJbbbZMg8A:lJbbb9p9DTmba8A:OhAxekcjjjj94hAkaAcCthAdndnaiclfIdbaHNJbbbZMg8A:lJbbb9p9DTmba8A:OhCxekcjjjj94hCkaCcqtaAVhAdndnaicwfIdbaHNJbbbZMg8A:lJbbb9p9DTmba8A:OhCxekcjjjj94hCkaeaAaCVBdbaicxfhiaeclfheamcufgmmbkascFeaPz:ljjjbhEcbh3cbh5indnaEaxa5cdtfydbgAcm4aA7c:v;t;h;Ev2gics4ai7aOGgmcdtfgCydbgecuSmbaeaASmbcehiinaEamaifaOGgmcdtfgCydbgecuSmeaicefhiaeaA9hmbkkaCaABdba3aecuSfh3a5cefg5ad9hmbxdkkascFeaPz:ljjjb8Acbh3kaDaYa3ar0giEhmaLa3aiEhCdna3arSmbaYaKaiEgAam9Rcd9imbdndnaXcl0mbdnaQ:ZgHaL:Zg8A:taY:Yg8EaD:Y:tg8Fa8EaK:Y:tgaa3:Zghaz:tNNNaHaz:taaNa8Aah:tNa8Aaz:ta8FNahaH:tNM:va8EMJbbbZMgH:lJbbb9p9DTmbaH:Ohexdkcjjjj94hexekamaAfcd9Theka3aQaiEhQaXcefgXcs9hmekkdndnaCmbcihicbhDxekcbhiawakcbyd;S1jjbHjjjjbbg5BdKawclBd2dndnadTmbamcuf:YhHaqhiaxheadhmindndnaiIdbaHNJbbbZMg8A:lJbbb9p9DTmba8A:OhAxekcjjjj94hAkaAcCthAdndnaiclfIdbaHNJbbbZMg8A:lJbbb9p9DTmba8A:OhCxekcjjjj94hCkaCcqtaAVhAdndnaicwfIdbaHNJbbbZMg8A:lJbbb9p9DTmba8A:OhCxekcjjjj94hCkaeaAaCVBdbaicxfhiaeclfheamcufgmmbkascFeaPz:ljjjbhEcbhDcbh3inaxa3cdtgYfydbgAcm4aA7c:v;t;h;Ev2gics4ai7hecbhidndninaEaeaOGgmcdtfgCydbgecuSmednaxaecdtgCfydbaASmbaicefgiamfheaiaO9nmekka5aCfydbhixekaCa3BdbaDhiaDcefhDka5aYfaiBdba3cefg3ad9hmbkcuaDc32giaDc;j:KM;jb0EhexekascFeaPz:ljjjb8AcbhDcbhekawaecbyd;S1jjbHjjjjbbgeBd3awcvBd2aecbaiz:ljjjbhCavcd4hxdnadTmbdnalTmbaxcdthEa5hAalheaqhmadhOinaCaAydbc32fgiamIdbaiIdbMUdbaiamclfIdbaiIdlMUdlaiamcwfIdbaiIdwMUdwaiaeIdbaiIdxMUdxaiaeclfIdbaiIdzMUdzaiaecwfIdbaiIdCMUdCaiaiIdKJbbjZMUdKaAclfhAaeaEfheamcxfhmaOcufgOmbxdkka5hmaqheadhAinaCamydbc32fgiaeIdbaiIdbMUdbaiaeclfIdbaiIdlMUdlaiaecwfIdbaiIdwMUdwaiaiIdxJbbbbMUdxaiaiIdzJbbbbMUdzaiaiIdCJbbbbMUdCaiaiIdKJbbjZMUdKamclfhmaecxfheaAcufgAmbkkdnaDTmbaChiaDheinaiaiIdbJbbbbJbbjZaicKfIdbgH:vaHJbbbb9BEgHNUdbaiclfgmaHamIdbNUdbaicwfgmaHamIdbNUdbaicxfgmaHamIdbNUdbaiczfgmaHamIdbNUdbaicCfgmaHamIdbNUdbaic3fhiaecufgembkkcbhAawcuaDcdtgYaDcFFFFi0Egicbyd;S1jjbHjjjjbbgeBdaawcoBd2awaicbyd;S1jjbHjjjjbbgEBd8KaecFeaYz:ljjjbh3dnadTmbaoaoNh8Aaxcdthxalheina8Aaec;C1jjbalEgmIdwaCa5ydbgOc32fgiIdC:tgHaHNamIdbaiIdx:tgHaHNamIdlaiIdz:tgHaHNMMNaqcwfIdbaiIdw:tgHaHNaqIdbaiIdb:tgHaHNaqclfIdbaiIdl:tgHaHNMMMhHdndna3aOcdtgifgmydbcuSmbaEaifIdbaH9ETmekamaABdbaEaifaHUdbka5clfh5aeaxfheaqcxfhqadaAcefgA9hmbkkaba3aYz:kjjjb8AcrhikaicdthiinaiTmeaic98fgiawcxffydbcbyd;O1jjbH:bjjjbbxbkkawc;Wbf8KjjjjbaDk:Odieui99iu8Jjjjjbca9RgicFFF;7rBd3ai9cFFF;7;3FF:;Fb83dCaicFFF97Bdzai9cFFF;7FFF:;u83dwdndnaembJbbjFhlJbbjFhvJbbjFhoxekadcd4cdthrcbhwincbhdinaicCfadfgDabadfIdbglaDIdbgvaval9EEUdbaicwfadfgDalaDIdbgvaval9DEUdbadclfgdcx9hmbkabarfhbawcefgwae9hmbkaiIdzaiId3:thoaiIdxaiIdK:thvaiIdwaiIdC:thlkJbbbbalalJbbbb9DEglavaval9DEglaoaoal9DEk9DeeuabcFeaicdtz:ljjjbhlcbhbdnadTmbindnalaeydbcdtfgiydbcu9hmbaiabBdbabcefhbkaeclfheadcufgdmbkkabk9teiucbcbyd;W1jjbgeabcifc98GfgbBd;W1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabk9teiucbcbyd;W1jjbgeabcrfc94GfgbBd;W1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik9:eiuZbhedndncbyd;W1jjbgdaecztgi9nmbcuheadai9RcFFifcz4nbcuSmekadhekcbabae9Rcifc98Gcbyd;W1jjbfgdBd;W1jjbdnadZbcztge9nmbadae9RcFFifcz4nb8Akk6eiucbhidnadTmbdninabRbbglaeRbbgv9hmeaecefheabcefhbadcufgdmbxdkkalav9Rhikaikk:bedbcjwk9Oebbbdbbbbbbbebbbeeebeebebbeeebebbbbbebebbbbbebbbdbbbbbbbbbbbbbbbeeeeebebbbbbebbbbbeebbbbbbbbbbbbbbbbbbbbbc;Owkxebbbdbbbj9Kbb",e=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var t,a=WebAssembly.instantiate(r(n),{}).then(function(_){t=_.instance,t.exports.__wasm_call_ctors()});function r(_){for(var p=new Uint8Array(_.length),v=0;v<_.length;++v){var u=_.charCodeAt(v);p[v]=u>96?u-97:u>64?u-39:u+4}for(var S=0,v=0;v<_.length;++v)p[S++]=p[v]<60?e[p[v]]:(p[v]-60)*64+p[++v];return p.buffer.slice(0,S)}function s(_){if(!_)throw new Error("Assertion failed")}function i(_){return new Uint8Array(_.buffer,_.byteOffset,_.byteLength)}function o(_,p,v){var u=t.exports.sbrk,S=u(p.length*4),g=u(v*4),x=new Uint8Array(t.exports.memory.buffer),T=i(p);x.set(T,S);var C=_(g,S,p.length,v);x=new Uint8Array(t.exports.memory.buffer);var f=new Uint32Array(v);new Uint8Array(f.buffer).set(x.subarray(g,g+v*4)),T.set(x.subarray(S,S+p.length*4)),u(S-u(0));for(var w=0;w<p.length;++w)p[w]=f[p[w]];return[f,C]}function l(_){for(var p=0,v=0;v<_.length;++v){var u=_[v];p=p<u?u:p}return p}function c(_,p,v,u,S,g,x,T,C){var f=t.exports.sbrk,w=f(4),R=f(v*4),I=f(S*g),D=f(v*4),M=new Uint8Array(t.exports.memory.buffer);M.set(i(u),I),M.set(i(p),D);var A=_(R,D,v,I,S,g,x,T,C,w);M=new Uint8Array(t.exports.memory.buffer);var k=new Uint32Array(A);i(k).set(M.subarray(R,R+A*4));var P=new Float32Array(1);return i(P).set(M.subarray(w,w+4)),f(w-f(0)),[k,P[0]]}function h(_,p,v,u,S,g,x,T,C,f,w,R,I){var D=t.exports.sbrk,M=D(4),A=D(v*4),k=D(S*g),P=D(S*T),N=D(C.length*4),O=D(v*4),j=f?D(S):0,L=new Uint8Array(t.exports.memory.buffer);L.set(i(u),k),L.set(i(x),P),L.set(i(C),N),L.set(i(p),O),f&&L.set(i(f),j);var Se=_(A,O,v,k,S,g,P,T,N,C.length,j,w,R,I,M);L=new Uint8Array(t.exports.memory.buffer);var le=new Uint32Array(Se);i(le).set(L.subarray(A,A+Se*4));var ce=new Float32Array(1);return i(ce).set(L.subarray(M,M+4)),D(M-D(0)),[le,ce[0]]}function d(_,p,v,u){var S=t.exports.sbrk,g=S(v*u),x=new Uint8Array(t.exports.memory.buffer);x.set(i(p),g);var T=_(g,v,u);return S(g-S(0)),T}function m(_,p,v,u,S,g,x,T){var C=t.exports.sbrk,f=C(T*4),w=C(v*u),R=C(v*g),I=new Uint8Array(t.exports.memory.buffer);I.set(i(p),w),S&&I.set(i(S),R);var D=_(f,w,v,u,R,g,x,T);I=new Uint8Array(t.exports.memory.buffer);var M=new Uint32Array(D);return i(M).set(I.subarray(f,f+D*4)),C(f-C(0)),M}var b={LockBorder:1,Sparse:2,ErrorAbsolute:4};return{ready:a,supported:!0,useExperimentalFeatures:!1,compactMesh:function(_){s(_ instanceof Uint32Array||_ instanceof Int32Array||_ instanceof Uint16Array||_ instanceof Int16Array),s(_.length%3==0);var p=_.BYTES_PER_ELEMENT==4?_:new Uint32Array(_);return o(t.exports.meshopt_optimizeVertexFetchRemap,p,l(_)+1)},simplify:function(_,p,v,u,S,g){s(_ instanceof Uint32Array||_ instanceof Int32Array||_ instanceof Uint16Array||_ instanceof Int16Array),s(_.length%3==0),s(p instanceof Float32Array),s(p.length%v==0),s(v>=3),s(u>=0&&u<=_.length),s(u%3==0),s(S>=0);for(var x=0,T=0;T<(g?g.length:0);++T)s(g[T]in b),x|=b[g[T]];var C=_.BYTES_PER_ELEMENT==4?_:new Uint32Array(_),f=c(t.exports.meshopt_simplify,C,_.length,p,p.length/v,v*4,u,S,x);return f[0]=_ instanceof Uint32Array?f[0]:new _.constructor(f[0]),f},simplifyWithAttributes:function(_,p,v,u,S,g,x,T,C,f){s(this.useExperimentalFeatures),s(_ instanceof Uint32Array||_ instanceof Int32Array||_ instanceof Uint16Array||_ instanceof Int16Array),s(_.length%3==0),s(p instanceof Float32Array),s(p.length%v==0),s(v>=3),s(u instanceof Float32Array),s(u.length%S==0),s(S>=0),s(x==null||x.length==p.length),s(T>=0&&T<=_.length),s(T%3==0),s(C>=0),s(Array.isArray(g)),s(S>=g.length),s(g.length<=16);for(var w=0,R=0;R<(f?f.length:0);++R)s(f[R]in b),w|=b[f[R]];var I=_.BYTES_PER_ELEMENT==4?_:new Uint32Array(_),D=h(t.exports.meshopt_simplifyWithAttributes,I,_.length,p,p.length/v,v*4,u,S*4,new Float32Array(g),x?new Uint8Array(x):null,T,C,w);return D[0]=_ instanceof Uint32Array?D[0]:new _.constructor(D[0]),D},getScale:function(_,p){return s(_ instanceof Float32Array),s(_.length%p==0),s(p>=3),d(t.exports.meshopt_simplifyScale,_,_.length/p,p*4)},simplifyPoints:function(_,p,v,u,S,g){return s(this.useExperimentalFeatures),s(_ instanceof Float32Array),s(_.length%p==0),s(p>=3),s(v>=0&&v<=_.length/p),u?(s(u instanceof Float32Array),s(u.length%S==0),s(S>=3),s(_.length/p==u.length/S),m(t.exports.meshopt_simplifyPoints,_,_.length/p,p*4,u,S*4,g,v)):m(t.exports.meshopt_simplifyPoints,_,_.length/p,p*4,void 0,0,0,v)}}})();class jl extends kf{constructor(e){super(e),this.fetchConfig=e}async readURI(e,t){const a=await yo(e,this.fetchConfig);if(!a.ok)throw new Error(`Failed to load asset: ${a.status} ${a.statusText}`);switch(t){case"view":return new Uint8Array(await a.arrayBuffer());case"text":return a.text()}}}async function J0(n,e){const t={},a=performance.now();e==null||e({phase:"Preparing decoder",detail:"Initializing mesh compression support."}),await _a.ready,await ua.ready;const r=new jl().registerExtensions(Fl).setVertexLayout(Jt.SEPARATE).registerDependencies({"meshopt.decoder":_a,"meshopt.encoder":ua}),s=performance.now();e==null||e({phase:"Reading files",detail:"Collecting dropped glTF assets."});const i=await Wp(r,n);t.readMs=performance.now()-s;const o=performance.now();e==null||e({phase:"Preparing geometry",detail:"Expanding compressed and quantized attributes."}),await i.transform(Nl()),t.transformMs=performance.now()-o;const l=await Bl(i,e);return l.profile={...l.profile,...t,totalLoadMs:performance.now()-a},l}async function Y0(n,e){const t={},a=performance.now();e==null||e({phase:"Preparing decoder",detail:"Initializing mesh compression support."}),await _a.ready,await ua.ready;const r=new jl().registerExtensions(Fl).setVertexLayout(Jt.SEPARATE).registerDependencies({"meshopt.decoder":_a,"meshopt.encoder":ua}),s=performance.now();e==null||e({phase:"Downloading scene",detail:"Fetching glTF document, buffers, and images."});const i=await r.read(wo(n));t.readMs=performance.now()-s;const o=performance.now();e==null||e({phase:"Preparing geometry",detail:"Expanding compressed and quantized attributes."}),await i.transform(Nl()),t.transformMs=performance.now()-o;const l=await Bl(i,e);return l.profile={...l.profile,...t,totalLoadMs:performance.now()-a},l}async function Wp(n,e){const t=new Map;for(const[,o]of e)t.set(o.name.split(".").pop()??"",o);const a=t.get("glb");if(a)return n.readBinary(new Uint8Array(await a.arrayBuffer()));if(!t.get("gltf"))throw new Error("No glTF scene found in dropped files.");const s={};let i=null;for(const[o,l]of e)if(l.name.endsWith(".gltf"))i=JSON.parse(await l.text());else{const c=await l.arrayBuffer();s[o.slice(1)]=new Uint8Array(c)}if(!i)throw new Error("No glTF scene found in dropped files.");return n.readJSON({json:i,resources:s})}async function Bl(n,e){var C,f,w,R;const a=n.getRoot().listScenes()[0];if(!a)throw new Error("This model contains no scene.");const r=performance.now();e==null||e({phase:"Parsing scene",detail:"Building CPU scene buffers and material textures."});const s=new vh,i=new Map,o=async(I,D,M)=>{if(!I)return-1;const A=I,k=Jp(A,D,M);return i.has(k)||i.set(k,qp(A,D,M).then(P=>s.addTexture(P))),i.get(k)};function l(I){var A;const D={shadingVertices:0,bvhVertices:0,bvhIndices:0},M=(A=I.getMesh)==null?void 0:A.call(I);if(M)for(const k of M.listPrimitives()){const P=k.getIndices(),N=k.getAttribute("POSITION");P&&N&&(D.shadingVertices+=N.getCount(),D.bvhVertices+=N.getCount(),D.bvhIndices+=P.getCount())}for(const k of I.listChildren()){const P=l(k);D.shadingVertices+=P.shadingVertices,D.bvhVertices+=P.bvhVertices,D.bvhIndices+=P.bvhIndices}return D}const c={shadingVertices:0,bvhVertices:0,bvhIndices:0};for(const I of a.listChildren()){const D=l(I);c.shadingVertices+=D.shadingVertices,c.bvhVertices+=D.bvhVertices,c.bvhIndices+=D.bvhIndices}const h=new Float32Array(c.shadingVertices*Oe),d=new Uint32Array(c.bvhIndices),m=new Float32Array(c.bvhVertices*3),b=new Uint32Array(c.bvhIndices);let _=0,p=0,v=0,u=0;const S=new Map,g=I=>(S.has(I)||S.set(I,Hp(I,o).then(D=>s.addMaterial(D))),S.get(I)),x=[];for(const I of a.listChildren())x.push({node:I,parentMatrix:Vl()});for(;x.length>0;){const{node:I,parentMatrix:D}=x.pop(),M=I.getMatrix()?new Float32Array(I.getMatrix()):Yp(I),A=$p(D,M);for(const N of I.listChildren())x.push({node:N,parentMatrix:A});const k=I.getMesh();if(!k)continue;const P=(C=I.getLight)==null?void 0:C.call(I);if(P){const N=new gh;N.position=[A[12]??0,A[13]??0,A[14]??0],N.type=((f=P.getType)==null?void 0:f.call(P))==="point"?0:1;const O=((w=P.getColor)==null?void 0:w.call(P))??[1,1,1],j=((R=P.getIntensity)==null?void 0:R.call(P))??1;N.emission=[O[0]*j,O[1]*j,O[2]*j],s.addLight(N)}for(const N of k.listPrimitives()){const O=N.getMaterial(),j=O?await g(O):0,L=zp(N,A,j,h,_,d,p,m,v,b,u);_+=L.shadingVertexCount,p+=L.shadingIndexCount,v+=L.bvhVertexCount,u+=L.bvhIndexCount}}s.triangleBuffer=_*Oe===h.length?h:h.slice(0,_*Oe),s.triangleIndexBuffer=p===d.length?d:d.slice(0,p),s.bvhPositionBuffer=v*3===m.length?m:m.slice(0,v*3),s.bvhIndexBuffer=u===b.length?b:b.slice(0,u);const T=performance.now()-r;return console.debug(`Scene parsing: ${T.toFixed(1)}ms`),{scene:s,profile:{parseMs:T}}}function zp(n,e,t,a,r,s,i,o,l,c,h){const d=n.getIndices();if(!d)return{shadingVertexCount:0,shadingIndexCount:0,bvhVertexCount:0,bvhIndexCount:0};const m=n.getAttribute("POSITION"),b=n.getAttribute("NORMAL"),_=n.getAttribute("TEXCOORD_0"),p=n.getAttribute("TEXCOORD_1"),v=n.getAttribute("TANGENT"),u=n.getAttribute("COLOR_0");if(!m)return{shadingVertexCount:0,shadingIndexCount:0,bvhVertexCount:0,bvhIndexCount:0};const S=Gt(m),g=b?Gt(b):null,x=_?Gt(_):null,T=p?Gt(p):null,C=v?Gt(v):null,f=u?t0(u):null,w=e0(d),R=Qp(e),I=m.getCount(),D=w.length,M=I;for(let A=0;A<D;A++){const k=w[A];s[i+A]=r+k,c[h+A]=l+k}for(let A=0;A<I;A++){const k=A*3,[P,N,O]=Zp(S[k+0],S[k+1],S[k+2],e),j=(r+A)*Oe,L=(l+A)*3;if(o[L+0]=P,o[L+1]=N,o[L+2]=O,a[j+0]=P,a[j+1]=N,a[j+2]=O,a[j+3]=t,g){const Se=g[k+0],le=g[k+1],ce=g[k+2],[Fe,de,je]=hi(Se,le,ce,R);a[j+4]=Fe,a[j+5]=de,a[j+6]=je}if(a[j+7]=0,a[j+8]=x?x[A*2+0]??0:0,a[j+9]=x?x[A*2+1]??0:0,a[j+10]=T?T[A*2+0]??0:0,a[j+11]=T?T[A*2+1]??0:0,C){const Se=C[A*4+0],le=C[A*4+1],ce=C[A*4+2],Fe=C[A*4+3],[de,je,Be]=hi(Se,le,ce,R);a[j+12]=de,a[j+13]=je,a[j+14]=Be,a[j+15]=Fe}a[j+16]=f?f[A*4+0]??1:1,a[j+17]=f?f[A*4+1]??1:1,a[j+18]=f?f[A*4+2]??1:1,a[j+19]=f?f[A*4+3]??1:1}return{shadingVertexCount:I,shadingIndexCount:D,bvhVertexCount:M,bvhIndexCount:D}}async function Hp(n,e){var S,g,x,T,C,f,w,R,I,D,M,A,k,P,N,O,j,L,Se,le,ce,Fe,de,je,Be,Vn,Ln,Un,ie,ue,yt,Gn,an,Er,Cr,Ir,Rr,Ar,Dr,Mr,Pr,Fr,kr,Nr,jr,Br,Or,Vr,Lr,Ur,Gr,Wr,zr,Hr,Xr,Kr,qr,Jr,Yr,$r,Qr,Zr,es,ts,ns,as,rs,ss,is,os,ls,cs,us,_s,ds,hs;const t=new bh,a=n;t.name=((S=a.getName)==null?void 0:S.call(a))??"material";const r=((g=a.getBaseColorFactor)==null?void 0:g.call(a))??[1,1,1,1];t.baseColorFactor=[r[0],r[1],r[2]];const s=((x=a.getAlphaMode)==null?void 0:x.call(a))??"OPAQUE",i=r[3]??1;t.cutoutOpacity=s==="OPAQUE"?1:i,t.alphaCutoff=s==="MASK"?((T=a.getAlphaCutoff)==null?void 0:T.call(a))??.5:s==="OPAQUE"?1:0,t.metallicFactor=((C=a.getMetallicFactor)==null?void 0:C.call(a))??0,t.roughnessFactor=((f=a.getRoughnessFactor)==null?void 0:f.call(a))??1,t.normalScale=((w=a.getNormalScale)==null?void 0:w.call(a))??1,t.emissiveFactor=((R=a.getEmissiveFactor)==null?void 0:R.call(a))??[0,0,0],t.doubleSided=(I=a.getDoubleSided)!=null&&I.call(a)?1:0,t.baseColorTextureId=await e(((D=a.getBaseColorTexture)==null?void 0:D.call(a))??null,((M=a.getBaseColorTextureInfo)==null?void 0:M.call(a))??null,"srgb"),t.metallicRoughnessTextureId=await e(((A=a.getMetallicRoughnessTexture)==null?void 0:A.call(a))??null,((k=a.getMetallicRoughnessTextureInfo)==null?void 0:k.call(a))??null,"linear"),t.normalTextureId=await e(((P=a.getNormalTexture)==null?void 0:P.call(a))??null,((N=a.getNormalTextureInfo)==null?void 0:N.call(a))??null,"linear"),t.emissiveTextureId=await e(((O=a.getEmissiveTexture)==null?void 0:O.call(a))??null,((j=a.getEmissiveTextureInfo)==null?void 0:j.call(a))??null,"srgb");const o=(L=a.getExtension)==null?void 0:L.call(a,"KHR_materials_emissive_strength");if(o){const jt=((Se=o.getEmissiveStrength)==null?void 0:Se.call(o))??1;t.emissiveFactor=t.emissiveFactor.map(rn=>rn*jt)}const l=(le=a.getExtension)==null?void 0:le.call(a,"KHR_materials_ior");l&&(t.ior=((ce=l.getIOR)==null?void 0:ce.call(l))??t.ior);const c=(Fe=a.getExtension)==null?void 0:Fe.call(a,"KHR_materials_specular");c&&(t.specularFactor=((de=c.getSpecularFactor)==null?void 0:de.call(c))??1,t.specularColorFactor=((je=c.getSpecularColorFactor)==null?void 0:je.call(c))??[1,1,1],t.specularTextureId=await e(((Be=c.getSpecularTexture)==null?void 0:Be.call(c))??null,((Vn=c.getSpecularTextureInfo)==null?void 0:Vn.call(c))??null,"linear"),t.specularColorTextureId=await e(((Ln=c.getSpecularColorTexture)==null?void 0:Ln.call(c))??null,((Un=c.getSpecularColorTextureInfo)==null?void 0:Un.call(c))??null,"srgb"));const h=(ie=a.getExtension)==null?void 0:ie.call(a,"KHR_materials_transmission");h&&(t.transmissionFactor=((ue=h.getTransmissionFactor)==null?void 0:ue.call(h))??0,t.transmissionTextureId=await e(((yt=h.getTransmissionTexture)==null?void 0:yt.call(h))??null,((Gn=h.getTransmissionTextureInfo)==null?void 0:Gn.call(h))??null,"linear"));const d=(an=a.getExtension)==null?void 0:an.call(a,"KHR_materials_volume");if(d){const jt=((Er=d.getThicknessFactor)==null?void 0:Er.call(d))??0;t.thinWalled=jt===0?1:0,t.attenuationColor=((Cr=d.getAttenuationColor)==null?void 0:Cr.call(d))??[1,1,1];const rn=(Ir=d.getAttenuationDistance)==null?void 0:Ir.call(d);t.attenuationDistance=!rn||rn===0?Number.MAX_VALUE:rn}const m=(Rr=a.getExtension)==null?void 0:Rr.call(a,"KHR_materials_clearcoat");m&&(t.clearcoatFactor=((Ar=m.getClearcoatFactor)==null?void 0:Ar.call(m))??0,t.clearcoatRoughnessFactor=((Dr=m.getClearcoatRoughnessFactor)==null?void 0:Dr.call(m))??0,t.clearcoatNormalTextureScale=((Mr=m.getClearcoatNormalScale)==null?void 0:Mr.call(m))??1,t.clearcoatTextureId=await e(((Pr=m.getClearcoatTexture)==null?void 0:Pr.call(m))??null,((Fr=m.getClearcoatTextureInfo)==null?void 0:Fr.call(m))??null,"linear"),t.clearcoatRoughnessTextureId=await e(((kr=m.getClearcoatRoughnessTexture)==null?void 0:kr.call(m))??null,((Nr=m.getClearcoatRoughnessTextureInfo)==null?void 0:Nr.call(m))??null,"linear"),t.clearcoatNormalTextureId=await e(((jr=m.getClearcoatNormalTexture)==null?void 0:jr.call(m))??null,((Br=m.getClearcoatNormalTextureInfo)==null?void 0:Br.call(m))??null,"linear"));const b=(Or=a.getExtension)==null?void 0:Or.call(a,"KHR_materials_sheen");b&&(t.sheenColorFactor=((Vr=b.getSheenColorFactor)==null?void 0:Vr.call(b))??[0,0,0],t.sheenRoughnessFactor=((Lr=b.getSheenRoughnessFactor)==null?void 0:Lr.call(b))??0,t.sheenColorTextureId=await e(((Ur=b.getSheenColorTexture)==null?void 0:Ur.call(b))??null,((Gr=b.getSheenColorTextureInfo)==null?void 0:Gr.call(b))??null,"srgb"),t.sheenRoughnessTextureId=await e(((Wr=b.getSheenRoughnessTexture)==null?void 0:Wr.call(b))??null,((zr=b.getSheenRoughnessTextureInfo)==null?void 0:zr.call(b))??null,"linear"));const _=(Hr=a.getExtension)==null?void 0:Hr.call(a,"KHR_materials_anisotropy");if(_){const jt=((Xr=_.getAnisotropyRotation)==null?void 0:Xr.call(_))??0;t.anisotropy=((Kr=_.getAnisotropyStrength)==null?void 0:Kr.call(_))??0,t.anisotropyDirection=[Math.cos(jt),Math.sin(jt),0],t.anisotropyTextureId=await e(((qr=_.getAnisotropyTexture)==null?void 0:qr.call(_))??null,((Jr=_.getAnisotropyTextureInfo)==null?void 0:Jr.call(_))??null,"linear")}const p=(Yr=a.getExtension)==null?void 0:Yr.call(a,"KHR_materials_iridescence");p&&(t.iridescenceFactor=(($r=p.getIridescenceFactor)==null?void 0:$r.call(p))??0,t.iridescenceIor=((Qr=p.getIridescenceIOR)==null?void 0:Qr.call(p))??t.iridescenceIor,t.iridescenceThicknessMinimum=((Zr=p.getIridescenceThicknessMinimum)==null?void 0:Zr.call(p))??t.iridescenceThicknessMinimum,t.iridescenceThicknessMaximum=((es=p.getIridescenceThicknessMaximum)==null?void 0:es.call(p))??t.iridescenceThicknessMaximum,t.iridescenceTextureId=await e(((ts=p.getIridescenceTexture)==null?void 0:ts.call(p))??null,((ns=p.getIridescenceTextureInfo)==null?void 0:ns.call(p))??null,"linear"),t.iridescenceThicknessTextureId=await e(((as=p.getIridescenceThicknessTexture)==null?void 0:as.call(p))??null,((rs=p.getIridescenceThicknessTextureInfo)==null?void 0:rs.call(p))??null,"linear"));const v=(ss=a.getExtension)==null?void 0:ss.call(a,"KHR_materials_dispersion");v&&(t.dispersion=((is=v.getDispersion)==null?void 0:is.call(v))??0);const u=(os=a.getExtension)==null?void 0:os.call(a,"KHR_materials_diffuse_transmission");return u&&(t.diffuseTransmissionFactor=((ls=u.getDiffuseTransmissionFactor)==null?void 0:ls.call(u))??0,t.diffuseTransmissionColorFactor=((cs=u.getDiffuseTransmissionColorFactor)==null?void 0:cs.call(u))??[1,1,1],t.diffuseTransmissionTextureId=await e(((us=u.getDiffuseTransmissionTexture)==null?void 0:us.call(u))??null,((_s=u.getDiffuseTransmissionTextureInfo)==null?void 0:_s.call(u))??null,"linear"),t.diffuseTransmissionColorTextureId=await e(((ds=u.getDiffuseTransmissionColorTexture)==null?void 0:ds.call(u))??null,((hs=u.getDiffuseTransmissionColorTextureInfo)==null?void 0:hs.call(u))??null,"srgb")),t.dirty=!1,t}const Xp=new Set(["image/png","image/jpeg","image/webp","image/avif"]);function Kp(n){const e=new Uint8Array(n.byteLength);return e.set(n),e}async function qp(n,e,t){var b,_,p,v,u,S,g,x,T;const a=(b=n.getImage)==null?void 0:b.call(n),r=((_=n.getMimeType)==null?void 0:_.call(n))??"";if(!a||!Xp.has(r))throw new Error(`Unsupported texture "${((p=n.getName)==null?void 0:p.call(n))??""}" (${r||"unknown mime"})`);const s=new Blob([Kp(a)],{type:r}),i=await createImageBitmap(s),o=document.createElement("canvas");o.width=Math.max(1,i.width),o.height=Math.max(1,i.height),o.getContext("2d").drawImage(i,0,0),i.close();const c=(v=e==null?void 0:e.getExtension)==null?void 0:v.call(e,"KHR_texture_transform"),h=((u=c==null?void 0:c.getOffset)==null?void 0:u.call(c))??[0,0],d=((S=c==null?void 0:c.getScale)==null?void 0:S.call(c))??[1,1],m=((g=e==null?void 0:e.getTexCoord)==null?void 0:g.call(e))??0;return{uuid:`${((x=n.getName)==null?void 0:x.call(n))??((T=n.getURI)==null?void 0:T.call(n))??"tex"}:${r}:${t}:${i.width}x${i.height}:${Ol(a)}`,image:o,colorSpace:t,offset:{x:h[0]??0,y:h[1]??0},repeat:{x:d[0]??1,y:d[1]??1},uvSet:m}}function Jp(n,e,t){var c,h,d,m,b,_,p;const a=(c=n.getImage)==null?void 0:c.call(n),r=`${((h=n.getName)==null?void 0:h.call(n))??""}:${((d=n.getMimeType)==null?void 0:d.call(n))??""}:${t}:${a?Ol(a):"noimage"}`,s=(m=e==null?void 0:e.getExtension)==null?void 0:m.call(e,"KHR_texture_transform"),i=((b=s==null?void 0:s.getOffset)==null?void 0:b.call(s))??[0,0],o=((_=s==null?void 0:s.getScale)==null?void 0:_.call(s))??[1,1],l=((p=e==null?void 0:e.getTexCoord)==null?void 0:p.call(e))??0;return`${r}|uv=${l}|off=${i[0]??0},${i[1]??0}|scale=${o[0]??1},${o[1]??1}`}function Ol(n){let e=2166136261;for(let t=0;t<n.length;t++)e^=n[t],e=Math.imul(e,16777619)>>>0;return e.toString(16)}function Vl(){const n=new Float32Array(16);return n[0]=1,n[5]=1,n[10]=1,n[15]=1,n}function Yp(n){var w,R,I;const e=Vl(),t=((w=n.getTranslation)==null?void 0:w.call(n))??[0,0,0],a=((R=n.getRotation)==null?void 0:R.call(n))??[0,0,0,1],r=((I=n.getScale)==null?void 0:I.call(n))??[1,1,1],[s,i,o,l]=a,[c,h,d]=r,m=s*2,b=i*2,_=o*2,p=s*m,v=s*b,u=s*_,S=i*b,g=i*_,x=o*_,T=l*m,C=l*b,f=l*_;return e[0]=(1-(S+x))*c,e[1]=(v+f)*c,e[2]=(u-C)*c,e[4]=(v-f)*h,e[5]=(1-(p+x))*h,e[6]=(g+T)*h,e[8]=(u+C)*d,e[9]=(g-T)*d,e[10]=(1-(p+S))*d,e[12]=t[0],e[13]=t[1],e[14]=t[2],e[15]=1,e}function $p(n,e){const t=new Float32Array(16);for(let a=0;a<4;a++)for(let r=0;r<4;r++){let s=0;for(let i=0;i<4;i++)s+=n[a+i*4]*e[i+r*4];t[a+r*4]=s}return t}function Qp(n){const e=n,t=e[0],a=e[4],r=e[8],s=e[1],i=e[5],o=e[9],l=e[2],c=e[6],h=e[10],d=h*i-o*c,m=-h*s+o*l,b=c*s-i*l;let _=t*d+a*m+r*b;return Math.abs(_)<=1e-12?new Float32Array([1,0,0,0,1,0,0,0,1]):(_=1/_,new Float32Array([d*_,(-h*a+r*c)*_,(o*a-r*i)*_,m*_,(h*t-r*l)*_,(-o*t+r*s)*_,b*_,(-c*t+a*l)*_,(i*t-a*s)*_]))}function Zp(n,e,t,a){return[a[0]*n+a[4]*e+a[8]*t+a[12],a[1]*n+a[5]*e+a[9]*t+a[13],a[2]*n+a[6]*e+a[10]*t+a[14]]}function hi(n,e,t,a){const r=a[0]*n+a[3]*e+a[6]*t,s=a[1]*n+a[4]*e+a[7]*t,i=a[2]*n+a[5]*e+a[8]*t,o=Math.sqrt(r*r+s*s+i*i);return o>1e-8?[r/o,s/o,i/o]:[r,s,i]}function Gt(n){const e=n.getArray();return e instanceof Float32Array?new Float32Array(e):new Float32Array(e)}function e0(n){const e=n.getArray();return e instanceof Uint32Array?new Uint32Array(e):Uint32Array.from(e)}function t0(n){const e=Gt(n),t=n.getElementSize();if(t===4)return e;const a=new Float32Array(e.length/t*4);for(let r=0,s=0;r<e.length;r+=t,s+=4)a[s]=e[r]??1,a[s+1]=e[r+1]??1,a[s+2]=e[r+2]??1,a[s+3]=1;return a}class ne{constructor(e=0,t=0,a=0){this.x=e,this.y=t,this.z=a}set(e,t,a){return this.x=e,this.y=t,this.z=a,this}clone(){return new ne(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}fromArray(e,t=0){return this.x=e[t+0]??0,this.y=e[t+1]??0,this.z=e[t+2]??0,this}toArray(){return[this.x,this.y,this.z]}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}crossVectors(e,t){const a=e.y*t.z-e.z*t.y,r=e.z*t.x-e.x*t.z,s=e.x*t.y-e.y*t.x;return this.x=a,this.y=r,this.z=s,this}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.lengthSq())}normalize(){const e=this.length();return e>1e-8&&this.multiplyScalar(1/e),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}}class n0{constructor(){y(this,"elements",new Float32Array(16));this.identity()}identity(){const e=this.elements;return e[0]=1,e[4]=0,e[8]=0,e[12]=0,e[1]=0,e[5]=1,e[9]=0,e[13]=0,e[2]=0,e[6]=0,e[10]=1,e[14]=0,e[3]=0,e[7]=0,e[11]=0,e[15]=1,this}copy(e){return this.elements.set(e.elements),this}}class $0{constructor(){y(this,"min");y(this,"max");this.min=new ne(1/0,1/0,1/0),this.max=new ne(-1/0,-1/0,-1/0)}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}expandByPoint(e){return this.min.min(e),this.max.max(e),this}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.set((this.min.x+this.max.x)*.5,(this.min.y+this.max.y)*.5,(this.min.z+this.max.z)*.5)}getSize(){return this.isEmpty()?new ne:new ne(this.max.x-this.min.x,this.max.y-this.min.y,this.max.z-this.min.z)}}function Jn(n,e,t){return Math.min(t,Math.max(e,n))}const a0=new ne(0,1,0),r0=new ne(0,0,-1),Vt=new ne,fi=new ne,Yn=new ne;class Q0{constructor(e,t,a,r){y(this,"position",new ne);y(this,"matrixWorld",new n0);y(this,"forward",new ne(0,0,-1));y(this,"right",new ne(1,0,0));y(this,"up",new ne(0,1,0));this.fov=e,this.aspect=t,this.near=a,this.far=r,this.updateMatrixWorld()}lookAt(e){this.forward.subVectors(e,this.position).normalize(),this.forward.lengthSq()<=1e-10&&this.forward.copy(r0),Vt.crossVectors(this.forward,a0),Vt.lengthSq()<=1e-10&&Vt.set(1,0,0),Vt.normalize(),fi.crossVectors(Vt,this.forward).normalize(),this.right.copy(Vt),this.up.copy(fi),this.updateMatrixWorld()}getWorldDirection(e){return e.copy(this.forward)}updateMatrixWorld(){const e=this.matrixWorld.elements;Yn.copy(this.forward).multiplyScalar(-1),e[0]=this.right.x,e[4]=this.up.x,e[8]=Yn.x,e[12]=this.position.x,e[1]=this.right.y,e[5]=this.up.y,e[9]=Yn.y,e[13]=this.position.y,e[2]=this.right.z,e[6]=this.up.z,e[10]=Yn.z,e[14]=this.position.z,e[3]=0,e[7]=0,e[11]=0,e[15]=1}updateProjectionMatrix(){}}const ge=new ne,Lt=new ne,Ut=new ne(0,1,0),pi=new ne,bt=new ne,s0=16,i0=5e-4;class Z0{constructor(e,t){y(this,"listeners",new Map);y(this,"keyState",{forward:!1,backward:!1,left:!1,right:!1,up:!1,down:!1,fast:!1});y(this,"yaw",Math.PI);y(this,"pitch",0);y(this,"dragging",!1);y(this,"draggingButton",-1);y(this,"interactionActive",!1);y(this,"lastPointerX",0);y(this,"lastPointerY",0);y(this,"lastTouchDistance",0);y(this,"lastTouchCenterX",0);y(this,"lastTouchCenterY",0);y(this,"activeTouchPointers",new Map);y(this,"rafId",0);y(this,"lastTickTime",0);y(this,"pendingWheelDistance",0);y(this,"orbitTarget",new ne(0,0,0));y(this,"previousTouchAction","");y(this,"previousUserSelect","");y(this,"enabled",!0);y(this,"autoRotate",!1);y(this,"moveSpeed",6);y(this,"fastMoveMultiplier",4);y(this,"lookSpeed",.0035);y(this,"panSpeed",.002);y(this,"wheelSpeed",.001);y(this,"pinchZoomSpeed",.01);y(this,"onContextMenu",e=>e.preventDefault());y(this,"onPointerDown",e=>{var t,a,r,s;this.enabled&&(e.pointerType==="touch"&&(e.preventDefault(),this.activeTouchPointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.updateTouchGestureBaseline()),(a=(t=this.domElement).focus)==null||a.call(t),(s=(r=this.domElement).setPointerCapture)==null||s.call(r,e.pointerId),this.dragging=!0,this.draggingButton=e.pointerType==="touch"?0:e.button,this.lastPointerX=e.clientX,this.lastPointerY=e.clientY,this.beginInteraction())});y(this,"onPointerMove",e=>{if(!this.enabled||!this.dragging)return;if(e.pointerType==="touch"&&(e.preventDefault(),this.activeTouchPointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.activeTouchPointers.size>=2)){const r=this.computeTouchDistance(),s=this.computeTouchCenter();if(this.lastTouchDistance>0&&r>0){this.camera.getWorldDirection(ge);const i=(r-this.lastTouchDistance)*this.pinchZoomSpeed;this.camera.position.addScaledVector(ge,i)}s&&(this.applyPan(s.x-this.lastTouchCenterX,s.y-this.lastTouchCenterY),this.lastTouchCenterX=s.x,this.lastTouchCenterY=s.y),this.lastTouchDistance=r,this.camera.updateMatrixWorld(),this.syncAnglesFromCamera(),this.dispatch("change");return}const t=e.clientX-this.lastPointerX,a=e.clientY-this.lastPointerY;this.lastPointerX=e.clientX,this.lastPointerY=e.clientY,this.draggingButton===2?this.applyPan(t,a):this.draggingButton===0?this.applyOrbit(t,a):(this.yaw-=t*this.lookSpeed,this.pitch=Jn(this.pitch-a*this.lookSpeed,-Math.PI*.495,Math.PI*.495),this.updateCameraOrientation()),this.dispatch("change")});y(this,"onPointerUp",e=>{var t,a,r,s;if(this.dragging){if((e==null?void 0:e.pointerType)==="touch"&&(e.preventDefault(),typeof e.pointerId=="number"&&this.activeTouchPointers.delete(e.pointerId)),typeof(e==null?void 0:e.pointerId)=="number"&&((a=(t=this.domElement).hasPointerCapture)!=null&&a.call(t,e.pointerId))&&((s=(r=this.domElement).releasePointerCapture)==null||s.call(r,e.pointerId)),this.activeTouchPointers.size>=2){this.updateTouchGestureBaseline();return}if(this.activeTouchPointers.size===1){const i=this.activeTouchPointers.values().next().value;i&&(this.lastPointerX=i.x,this.lastPointerY=i.y),this.updateTouchGestureBaseline();return}this.lastTouchDistance=0,this.lastTouchCenterX=0,this.lastTouchCenterY=0,this.dragging=!1,this.draggingButton=-1,this.endInteractionIfIdle()}});y(this,"onWheel",e=>{this.enabled&&(e.preventDefault(),this.beginInteraction(),this.pendingWheelDistance+=-this.normalizeWheelDeltaY(e)*this.wheelSpeed)});y(this,"onKeyDown",e=>{!this.enabled||this.isEditingElement(e.target)||this.setKeyState(e.code,!0)&&this.beginInteraction()});y(this,"onKeyUp",e=>{this.setKeyState(e.code,!1)&&this.endInteractionIfIdle()});this.camera=e,this.domElement=t,this.syncAnglesFromCamera(),this.attach(),this.lastTickTime=performance.now(),this.tick=this.tick.bind(this),this.rafId=requestAnimationFrame(this.tick)}addEventListener(e,t){const a=this.listeners.get(e)??new Set;a.add(t),this.listeners.set(e,a)}removeEventListener(e,t){var a;(a=this.listeners.get(e))==null||a.delete(t)}dispose(){cancelAnimationFrame(this.rafId),this.detach()}update(){return!1}reset(){this.syncAnglesFromCamera()}setPose(e,t){this.camera.position.copy(e),this.lookAt(t)}lookAt(e){this.orbitTarget.copy(e),this.camera.lookAt(e),this.camera.updateMatrixWorld(),this.syncAnglesFromCamera(),this.dispatch("change")}attach(){this.previousTouchAction=this.domElement.style.touchAction,this.previousUserSelect=this.domElement.style.userSelect,this.domElement.style.touchAction="none",this.domElement.style.userSelect="none",this.domElement.addEventListener("contextmenu",this.onContextMenu),this.domElement.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp),window.addEventListener("pointercancel",this.onPointerUp),window.addEventListener("keydown",this.onKeyDown),window.addEventListener("keyup",this.onKeyUp),this.domElement.addEventListener("wheel",this.onWheel,{passive:!1})}detach(){this.domElement.style.touchAction=this.previousTouchAction,this.domElement.style.userSelect=this.previousUserSelect,this.domElement.removeEventListener("contextmenu",this.onContextMenu),this.domElement.removeEventListener("pointerdown",this.onPointerDown),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp),window.removeEventListener("pointercancel",this.onPointerUp),window.removeEventListener("keydown",this.onKeyDown),window.removeEventListener("keyup",this.onKeyUp),this.domElement.removeEventListener("wheel",this.onWheel)}tick(e){const t=Math.min((e-this.lastTickTime)/1e3,.05);if(this.lastTickTime=e,this.enabled){let a=!1;this.autoRotate&&(this.yaw+=t*.35,a=!0);const r=this.moveSpeed*t*(this.keyState.fast?this.fastMoveMultiplier:1);if(r>0&&this.hasMovementInput()&&(this.camera.getWorldDirection(ge).normalize(),Lt.crossVectors(ge,Ut).normalize(),this.keyState.forward&&this.camera.position.addScaledVector(ge,r),this.keyState.backward&&this.camera.position.addScaledVector(ge,-r),this.keyState.right&&this.camera.position.addScaledVector(Lt,r),this.keyState.left&&this.camera.position.addScaledVector(Lt,-r),this.keyState.up&&this.camera.position.addScaledVector(Ut,r),this.keyState.down&&this.camera.position.addScaledVector(Ut,-r),a=!0),Math.abs(this.pendingWheelDistance)>i0){this.camera.getWorldDirection(ge).normalize();const s=1-Math.exp(-18*t),i=this.pendingWheelDistance*s;this.pendingWheelDistance-=i,this.camera.position.addScaledVector(ge,i),this.camera.updateMatrixWorld(),this.syncAnglesFromCamera(),a=!0}else this.pendingWheelDistance!==0&&(this.pendingWheelDistance=0,this.endInteractionIfIdle());a&&(this.updateCameraOrientation(),this.dispatch("change"))}this.rafId=requestAnimationFrame(this.tick)}applyPan(e,t){this.camera.getWorldDirection(ge).normalize(),Lt.crossVectors(ge,Ut).normalize();const a=this.panSpeed*(this.camera.position.length()+1);this.camera.position.addScaledVector(Lt,-e*a),this.camera.position.addScaledVector(Ut,t*a),this.orbitTarget.addScaledVector(Lt,-e*a),this.orbitTarget.addScaledVector(Ut,t*a),this.camera.updateMatrixWorld(),this.syncAnglesFromCamera()}applyOrbit(e,t){bt.copy(this.camera.position).sub(this.orbitTarget);let a=bt.length();a<=1e-5&&(a=1,bt.set(0,0,a));const r=Math.atan2(bt.x,bt.z)-e*this.lookSpeed,s=Jn(Math.asin(Jn(bt.y/a,-1,1))+t*this.lookSpeed,-Math.PI*.495,Math.PI*.495),i=Math.cos(s);bt.set(Math.sin(r)*i*a,Math.sin(s)*a,Math.cos(r)*i*a),this.camera.position.copy(this.orbitTarget).add(bt),this.camera.lookAt(this.orbitTarget),this.camera.updateMatrixWorld(),this.syncAnglesFromCamera()}updateCameraOrientation(){const e=Math.cos(this.pitch);pi.set(Math.sin(this.yaw)*e,Math.sin(this.pitch),Math.cos(this.yaw)*e).add(this.camera.position),this.camera.lookAt(pi),this.camera.updateMatrixWorld()}syncAnglesFromCamera(){this.camera.getWorldDirection(ge).normalize(),this.pitch=Math.asin(Jn(ge.y,-1,1)),this.yaw=Math.atan2(ge.x,ge.z)}beginInteraction(){this.interactionActive||(this.interactionActive=!0,this.dispatch("start"))}endInteractionIfIdle(){!this.interactionActive||this.dragging||this.hasMovementInput()||(this.interactionActive=!1,this.dispatch("end"))}computeTouchDistance(){const e=Array.from(this.activeTouchPointers.values());return e.length<2?0:Math.hypot(e[1].x-e[0].x,e[1].y-e[0].y)}computeTouchCenter(){const e=Array.from(this.activeTouchPointers.values());if(e.length===0)return null;let t=0,a=0;for(const r of e)t+=r.x,a+=r.y;return{x:t/e.length,y:a/e.length}}updateTouchGestureBaseline(){this.lastTouchDistance=this.computeTouchDistance();const e=this.computeTouchCenter();if(!e){this.lastTouchCenterX=0,this.lastTouchCenterY=0;return}this.lastTouchCenterX=e.x,this.lastTouchCenterY=e.y}normalizeWheelDeltaY(e){return e.deltaMode===WheelEvent.DOM_DELTA_LINE?e.deltaY*s0:e.deltaMode===WheelEvent.DOM_DELTA_PAGE?e.deltaY*this.domElement.clientHeight:e.deltaY}hasMovementInput(){return this.keyState.forward||this.keyState.backward||this.keyState.left||this.keyState.right||this.keyState.up||this.keyState.down}setKeyState(e,t){const r={KeyW:"forward",KeyS:"backward",KeyA:"left",KeyD:"right",KeyQ:"down",KeyE:"up",ShiftLeft:"fast",ShiftRight:"fast"}[e];return!r||this.keyState[r]===t?!1:(this.keyState[r]=t,!0)}dispatch(e){for(const t of this.listeners.get(e)??[])t()}isEditingElement(e){var r;const t=e;if(!t)return!1;const a=(r=t.tagName)==null?void 0:r.toLowerCase();return a==="input"||a==="textarea"||t.isContentEditable}}export{$0 as B,l0 as P,ne as V,Z0 as W,u0 as a,Q0 as b,d0 as c,J0 as d,Y0 as e,_0 as l};
