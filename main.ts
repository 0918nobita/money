import { keepFunctions } from './keep';

function doGet() {
	const html = HtmlService.createHtmlOutputFromFile('index');
	return html;
}

keepFunctions(doGet);
