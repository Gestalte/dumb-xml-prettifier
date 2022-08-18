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

function prettifyXml(xml) {

	var string = "";
	string = xml;

	var arr = string.split(/(<[^>]*>)/gm).filter(m => m !== "").map(m => m.trim());

	var count = 0;
	var arr2 = [];

	for (let index = 0; index < arr.length; index++) {
		// <?xml version="1.0" encoding="UTF-8"?> header thing.
		if (arr[index].match(/^<\?/)) {
			count--;

			arr2.push((index == 0 ? "" : "\n") + arr[index]);
		}

		// Opending tag
		if (arr[index].match(/^<[^?\/]/)) {

			// NOTE: Not sure about this.
			// TODO: Maybe capture entire element including its closing tag then fold closing tags later.
			if (!arr[index - 1].match(/\/>$/)) {

				var currentTag = arr[index];
				var onlyTag = currentTag.match(/^<(.+?)\s/)[1];

				var pattern = "^</" + onlyTag + ">";

				if (!arr[index - 1].match(pattern)) {
					count++;
				}
			} else {
				count++
			}

			var x = "";
			var paddingAmount = count * 4;

			for (let i = 0; i < paddingAmount; i++) {
				x += " ";
			}

			arr[index] = arr[index].replace(/(.)\s\/>$/, "$1/>") // remove any space before closing tag />

			var temp = arr[index]
				.split(/(\w+="[\w\d\s\-\.\*\+\=]+"\/?>?)/g)
				.filter(ff => ff != "")
				.filter(ff => ff != " ")
				.map(mm => mm.trim());

			var newtemp = temp.map(ff => {
				var localPadding = paddingAmount + 4;
				var padding = "";

				for (let i = 0; i < localPadding; i++) {
					padding += " ";
				}

				return (ff.substring(0, 1) == "<" ? "" + x : "\n" + padding) + ff;
			});

			var newStr = "";

			newtemp.forEach(line => {
				newStr += line;
			});

			// var newS = newtemp.join("    ");

			// Cancel out closing tag />
			if (arr[index].match(/\/>$/)) {
				count--;
			}

			arr2.push(newStr);
		}

		// Closing tag
		if (arr[index].match(/^<\//)) {
			if (index != 0) {
				// Check that count wasn't already decreased due to previous tag ending with />
				if (!arr[index - 1].match(/\/>$/)) {

					var currentTag = arr[index];
					var openingTag = currentTag.replace('/', '').replace('>', '');

					if (!arr[index - 1].match(openingTag)) {
						count--;
					}
				}
			} else {
				count--;
			}

			var x = "";
			var paddingAmount = count * 4;

			for (let i = 0; i < paddingAmount; i++) {
				x += " ";
			}

			arr2.push(x + arr[index]);
		}
	}

	var newString = arr2.join("\n");

	return newString;
}