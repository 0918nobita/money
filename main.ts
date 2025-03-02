import { keepFunctions } from './keep';

function doGet() {
	const html = HtmlService.createHtmlOutputFromFile('index');
	return html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getData() {
	return { foo: 42 };
}

keepFunctions(doGet, getData);
