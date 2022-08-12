// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dumb-xml-prettifier" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('dumb-xml-prettifier.prettify', function () {
		// The code you place here will be executed every time your command is executed

		var doc = vscode.window.activeTextEditor.document;

		var docText = doc.getText();

		var returnText = prettifyXml(docText);

		vscode.workspace.openTextDocument({
			language: 'xml'
		})
			.then(doc => vscode.window.showTextDocument(doc))
			.then(editor => {
				let editBuilder = textEdit => {
					textEdit.insert(new vscode.Position(0, 0), String(returnText));
				};

				return editor.edit(editBuilder, {
					undoStopBefore: true,
					undoStopAfter: false
				})
					.then(() => editor);
			});

		vscode.window.showInformationMessage("Done.");
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

			arr2.push(arr[index]);
		}

		// Opending tag
		if (arr[index].match(/^<[^?\/]/)) {
			count++;

			var x = "";
			var paddingAmount = count * 4;

			for (let i = 0; i < paddingAmount; i++) {
				x += " ";
			}

			// TODO: newline attributes

			// line = line.replace(/(.)\s\/>$/, "$1/>") // remove any space before closing tag />
			// line = line.replace(/\s/, "\n");

			// Cancel out closing tag />
			if (arr[index].match(/\/>$/)) {
				count--;
			}

			arr2.push(x + arr[index]);
		}

		// Closing tag
		if (arr[index].match(/^<\//)) {
			if (index != 0) {
				// Check that count wasn't already decreased due to previous tag ending with />
				if (!arr[index - 1].match(/\/>$/)) {
					count--;
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