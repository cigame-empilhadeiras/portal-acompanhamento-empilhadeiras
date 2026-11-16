// Checklist Empilhadeiras: abre o app do checklist numa janela própria (modo aplicativo do Edge ou do Chrome).
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
)

const url = "https://arthurandrade-sys.github.io/portal/checklist/"

func main() {
	var cands []string
	for _, env := range []string{"ProgramFiles(x86)", "ProgramFiles", "LocalAppData"} {
		if b := os.Getenv(env); b != "" {
			cands = append(cands,
				filepath.Join(b, "Microsoft", "Edge", "Application", "msedge.exe"),
				filepath.Join(b, "Google", "Chrome", "Application", "chrome.exe"))
		}
	}
	for _, c := range cands {
		if _, err := os.Stat(c); err == nil {
			cmd := exec.Command(c, "--app="+url, "--window-size=1200,860")
			cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			if cmd.Start() == nil {
				return
			}
		}
	}
	// Sem Edge nem Chrome: abre no navegador padrão.
	cmd := exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	_ = cmd.Start()
}
