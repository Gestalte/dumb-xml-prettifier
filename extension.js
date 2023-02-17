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

		var selectedText = editor.document.getText(editor.selection);

		var pretty = prettifier();

		if (selectedText) {

			var returnText = pretty.prettifyXml(selectedText);

			editor.edit(editBuilder => {
				editBuilder.replace(editor.selection, returnText);
			});
		} else {

			var docText = editor.document.getText();

			var returnText = pretty.prettifyXml(docText);

			var lineCount = vscode.window.activeTextEditor.document.lineCount - 1;
			var charCount = editor.document.lineAt(editor.document.lineCount - 1).text.length;

			// Overwrite text in active document.
			editor.edit(builder => {
				builder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(lineCount, charCount)));
				builder.insert(new vscode.Position(0, 0), returnText);
			});
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

var prettifier = function () {

	let outputXmlLines = [];
	let paddingLevel = 0;

	function header(xmlLines, index) {

		paddingLevel--;

		outputXmlLines.push((index == 0 ? "" : "\n") + xmlLines[index]);
	}

	function openingTag(line, previousLine) {

		if (previousLine != undefined) {
			// /> at the end of the line
			if (!previousLine.match(/\/>$/)) {

				var onlyElementName = line.match(/^<(.+?)(\s|>$)/)[1];

				var pattern = "^</" + onlyElementName + ">";

				if (!previousLine.match(pattern)) {
					paddingLevel++;
				}
			} else {
				paddingLevel++
			}
		} // Padding stays the same because its the first line.

		let padding = "";
		let paddingAmount = paddingLevel * 4;

		for (let i = 0; i < paddingAmount; i++) {
			padding += " ";
		}

		line = line.replace(/(.)\s\/>$/, "$1/>") // remove any space before closing tag />

		var newStrArr = indentAttributes(line, paddingAmount, padding).flatMap((a) => a);

		// Cancel out closing tag />
		if (line.match(/\/>$/)) {
			paddingLevel--;
		}

		outputXmlLines.push(newStrArr.join(""));
	}

	function indentAttributes(line, paddingAmount, existingPadding) {

		var elementParts = line
			.split(/([a-zA-Z-:_]+="[\w\d\s\-\.\*\+\=]+"\/?>?)/g)
			.filter(ff => ff != "")
			.filter(ff => ff != " ")
			.map(mm => mm.trim());

		return elementParts.map(ff => {

			var amountOfLocalPadding = paddingAmount + 4;

			let localPadding = "";

			for (let i = 0; i < amountOfLocalPadding; i++) {
				localPadding += " ";
			}

			return (ff.substring(0, 1) == "<" ? "" + existingPadding : "\n" + localPadding) + ff;
		});
	}

	function closingTag(xmlLines, index) {

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

	return {
		prettifyXml: function (xml) {

			let xmlLines = xml
				.split(/(<[^>]*>)/gm)
				.filter(m => m !== "")
				.map(m => m.trim())
				.filter(f => f != '')
				.map(f => f.replace(/\r\n/g, " "));

			paddingLevel = 0;
			outputXmlLines = [];

			for (let index = 0; index < xmlLines.length; index++) {

				var currentLine = xmlLines[index];

				// <?xml version="1.0" encoding="UTF-8"?> header thing.
				if (currentLine.match(/^<\?/)) {
					header(xmlLines, index);
				}

				// Opending tag
				if (currentLine.match(/^<[^?\/]/)) {
					openingTag(currentLine, xmlLines[index - 1])
				}

				// Closing tag
				if (currentLine.match(/^<\//)) {
					closingTag(xmlLines, index);
				}
			}

			return outputXmlLines.join("\n").replace(/\n\s+\n/g, '\n');
		}
	}
}
