// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('dumb-xml-prettifier.prettify', function () {

		var editor = vscode.window.activeTextEditor;
		var docText = editor.document.getText();

		var returnText = prettifyXml(docText);

		var lineCount = vscode.window.activeTextEditor.document.lineCount - 1;
		var charCount = editor.document.lineAt(editor.document.lineCount - 1).text.length;

		// Overwrite text in active document.
		editor.edit(builder => {
			builder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(lineCount, charCount)));
			builder.insert(new vscode.Position(0, 0), returnText);
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

/**
 * @param {string} xml
 */
function prettifyXml(xml) {

	var xmlLines = xml.split(/(<[^>]*>)/gm).filter(m => m !== "").map(m => m.trim());

	xmlLines = xmlLines
		.filter(f => f != '')
		.map(f => f.replace(/\r\n/g," "));	

	var paddingLevel = 0;
	var outputXmlLines = [];

	for (let index = 0; index < xmlLines.length; index++) {
		// <?xml version="1.0" encoding="UTF-8"?> header thing.
		if (xmlLines[index].match(/^<\?/)) {
			paddingLevel--;

			outputXmlLines.push((index == 0 ? "" : "\n") + xmlLines[index]);
		}

		// Opending tag
		if (xmlLines[index].match(/^<[^?\/]/)) {

			// /> at the end of the line
			if (!xmlLines[index - 1].match(/\/>$/)) {

				var onlyElementName = xmlLines[index].match(/^<(.+?)\s/)[1];

				var pattern = "^</" + onlyElementName + ">";

				if (!xmlLines[index - 1].match(pattern)) {
					paddingLevel++;
				}
			} else {
				paddingLevel++
			}

			let padding = "";
			let paddingAmount = paddingLevel * 4;

			for (let i = 0; i < paddingAmount; i++) {
				padding += " ";
			}

			xmlLines[index] = xmlLines[index].replace(/(.)\s\/>$/, "$1/>") // remove any space before closing tag />

			// Split element tag into element name and attributes
			var elementParts = xmlLines[index]
				.split(/(\w+="[\w\d\s\-\.\*\+\=]+"\/?>?)/g)
				.filter(ff => ff != "")
				.filter(ff => ff != " ")
				.map(mm => mm.trim());

			var paddedElementParts = elementParts.map(ff => {

				var amountOfLocalPadding = paddingAmount + 4;

				let localPadding = "";

				for (let i = 0; i < amountOfLocalPadding; i++) {
					localPadding += " ";
				}

				return (ff.substring(0, 1) == "<" ? "" + padding : "\n" + localPadding) + ff;
			});

			var newStrArr = paddedElementParts.flatMap((a) => a);

			// Cancel out closing tag />
			if (xmlLines[index].match(/\/>$/)) {
				paddingLevel--;
			}

			outputXmlLines.push(newStrArr.join(""));
		}

		// Closing tag
		if (xmlLines[index].match(/^<\//)) {
			if (index != 0) {
				// Check that count wasn't already decreased due to previous tag ending with />
				if (!xmlLines[index - 1].match(/\/>$/)) {

					var openingTag = xmlLines[index].replace('/', '').replace('>', '');

					if (!xmlLines[index - 1].match(openingTag)) {
						paddingLevel--;
					}
				}
			} else {
				paddingLevel--;
			}

			let padding = "";
			var paddingAmount = paddingLevel * 4;

			for (let i = 0; i < paddingAmount; i++) {
				padding += " ";
			}

			outputXmlLines.push(padding + xmlLines[index]);
		}
	}

	return outputXmlLines.join("\n");
}