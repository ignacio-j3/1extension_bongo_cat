import * as vscode from 'vscode';

let isKeyPressed = false;

export function activate(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'bongoCat',
        'Bongo Cat',
        vscode.ViewColumn.Active, // Utiliza ViewColumn.Active
        {
            enableScripts: true
        }
    );

    panel.webview.html = getWebviewContent();

    const disposable = vscode.commands.registerCommand('extension.bongoCat', () => {
        vscode.window.showInformationMessage('¡Bongo Cat ha sido activado!');
    });

    context.subscriptions.push(disposable);

    vscode.workspace.onDidChangeTextDocument((event) => {
        // Verifica si se ha detenido el cambio en el documento
        if (event.contentChanges.length > 0) {
            isKeyPressed = !isKeyPressed;
            updateBongoCatImage(panel);
        }
    });
}

function getWebviewContent() {
    const imageIdleUri = getImageUri('idle.png');
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="${vscode.Uri.file(
                vscode.extensions.getExtension('your.extension.id')?.extensionPath + '/style.css'
            )}">
            <title>Bongo Cat</title>
        </head>
        <body>
            <div id="bongoCatPanel">
                <img src="${imageIdleUri}" alt="Bongo Cat Image" id="bongoCatImage">
            </div>
        </body>
        </html>
    `;
}

function updateBongoCatImage(panel: vscode.WebviewPanel) {
    const imageName = isKeyPressed ? 'right.png' : 'left.png';
    const imageUri = getImageUri(imageName);

    panel.webview.postMessage({ command: 'updateImage', uri: imageUri });
}

function getImageUri(imageName: string): vscode.Uri {
    return vscode.Uri.file(
        vscode.extensions.getExtension('your.extension.id')?.extensionPath + `/images/${imageName}`
    );
}

export function deactivate() {}
