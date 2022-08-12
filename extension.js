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
                textEdit.insert( new vscode.Position( 0, 0 ), String( returnText ) );
            };

            return editor.edit( editBuilder, {
                    undoStopBefore: true,
                    undoStopAfter: false
                } )
                .then( () => editor );
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

	// TODO: Format xml.

	var newString="";	

	return xml;
}