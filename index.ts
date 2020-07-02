import { JSDOM } from 'jsdom'
import { keys } from 'ts-transformer-keys';
const { document } = (new JSDOM().window)

export interface JsonInput {
	tag: Tags,
	styles: CSSStyleDeclaration,
	attributes: Attributes,
	content: JsonInput | JsonInput[] | string
}
enum Tags {
	div = 'div',
	img = 'img',
	span = 'span',
	strong = 'strong',
	a = 'a'
}

interface Attributes {
	href: string,
	src: string,
	color: string,
}




const iAttributes = keys<Attributes>();


export function jsonToHtml(json: JsonInput, imageProxyUrl: string = "") {
	if (!json.tag) throw new Error("Tag is required.")
	if (!Object.keys(Tags).includes(json.tag)) throw new Error("Invalid Tag: " + json.tag)
	const element = document.createElement(json.tag)
	if (json.attributes) {
		const attributeKeys = Object.keys(json.attributes);
		for (let i = 0; i < attributeKeys.length; i++) {
			const attrKey: any  = attributeKeys[i];
			if (!iAttributes.includes(attrKey)) throw new Error("Invalid Attribute: " + attrKey)
			if (json.tag.toLowerCase() === "img" && attrKey.toLowerCase() === "src") {
				element.setAttribute(attrKey, imageProxyUrl + json.attributes[attrKey]);
			} else {
				element.setAttribute(attrKey, json.attributes[attrKey]);
			}
		}
	}
	if (json.styles) {
		const styleKeys = Object.keys(json.styles);
		for (let s = 0; s < styleKeys.length; s++) {
			const styleKey = styleKeys[s];
			const styleVal = json.styles[styleKey];
			if (styleKey.toLowerCase() === "backgroundimage") {
				element.style[styleKey] = `url(${imageProxyUrl + styleVal})`;
			} else {
				element.style[styleKey] = styleVal;
			}
			
			
		}
	}
	if (typeof json.content === "object") {
		if (Array.isArray(json.content)) {
			for (let c = 0; c < json.content.length; c++) {
				const jsonContent = json.content[c];
				element.innerHTML+= jsonToHtml(jsonContent, imageProxyUrl)	
			}
			return element.outerHTML;
		} else {
			element.innerHTML = jsonToHtml(json.content, imageProxyUrl)!;
			return element.outerHTML;
		}
	}

	if (json.content) {
		element.innerHTML = encodeURI(json.content as string);
	}
	return element.outerHTML;

}