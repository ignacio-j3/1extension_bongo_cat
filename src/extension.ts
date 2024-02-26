import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // make web panel in panel 2 for bongo cat friend
    const panel = vscode.window.createWebviewPanel(
        'bongoCat',
        'Bongo Cat',
        vscode.ViewColumn.Two, // Mostrar en la columna dos
        { enableScripts: true }
    );

    // Obtén las rutas de las imágenes
    const bongoRightPath = vscode.Uri.joinPath(context.extensionUri, 'images', 'right.png');
    const bongoRightUri = panel.webview.asWebviewUri(bongoRightPath);
    const bongoLeftPath = vscode.Uri.joinPath(context.extensionUri, 'images', 'left.png');
    const bongoLeftUri = panel.webview.asWebviewUri(bongoLeftPath);
    const bongoIdlePath = vscode.Uri.joinPath(context.extensionUri, 'images', 'idle.png');
    const bongoIdleUri = panel.webview.asWebviewUri(bongoIdlePath);

    const bongoFrameGenerator = getBongoState();
    // Establece el contenido HTML con las rutas resueltas
    panel.webview.html = getWebviewContent(bongoLeftUri, bongoRightUri, bongoIdleUri);

    // Dispara la animación en el evento de escritura, pero aún dispara el comando de escritura predeterminado
    let typeCommand = vscode.commands.registerCommand('type', (...args) => {
        panel.webview.postMessage(bongoFrameGenerator.next().value);
        return vscode.commands.executeCommand('default:type', ...args);
    });

    context.subscriptions.push(typeCommand);

    // Configurar la eliminación
    panel.onDidDispose(
        () => {
            typeCommand.dispose();
        },
        null,
        context.subscriptions
    );
}

function getWebviewContent(bongoLeftUri: vscode.Uri, bongoRightUri: vscode.Uri, bongoIdleUri: vscode.Uri) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bongo Cat</title>
        </head>
        <body>
            <img id="bongo-idle" src="${bongoIdleUri}" width="100%" />
            <img id="bongo-left" src="${bongoLeftUri}" width="100%" hidden/>
            <img id="bongo-right" src="${bongoRightUri}" width="100%" hidden/>
            <script>
                const bongoLeft = document.getElementById('bongo-left');
                const bongoRight= document.getElementById('bongo-right');
                const bongoIdle= document.getElementById('bongo-idle');
                let timeout;

                window.addEventListener('message', event => {
                    const message = event.data;
                    clearTimeout(timeout);
                    if (message === 'left') {
                        bongoIdle.hidden = true;
                        bongoLeft.hidden = false;
                        bongoRight.hidden = true;
                    } else if (message === 'right') {
                        bongoIdle.hidden = true;
                        bongoLeft.hidden = true;
                        bongoRight.hidden = false;
                    } else if (message === 'idle') {
                        bongoLeft.hidden = true;
                        bongoRight.hidden = true;
                        bongoIdle.hidden = false;
                    }
                    timeout = setTimeout(() => { bongoLeft.hidden = true; bongoRight.hidden = true; bongoIdle.hidden = false; }, 200);
                });
            </script>
        </body>
        </html>`;
}

enum BongoState {
    LEFT = 'left',
    RIGHT = 'right',
    IDLE = 'idle'
}

function* getBongoState() {
    let current = BongoState.IDLE;
    while (true) {
        if (current === BongoState.LEFT) {
            current = BongoState.RIGHT;
            yield BongoState.RIGHT;
        } else if (current === BongoState.RIGHT) {
            current = BongoState.IDLE;
            yield BongoState.IDLE;
        } else {
            current = BongoState.LEFT;
            yield BongoState.LEFT;
        }
    }
}

// Este método se llama cuando tu extensión se desactiva
export function deactivate() {}
