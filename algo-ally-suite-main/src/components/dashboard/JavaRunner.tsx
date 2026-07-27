import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, Code2, Terminal, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const codeTemplates: Record<string, string> = {
    java: `public class DynamicAlgorithm {
    public Object execute() {
        int a = 5;
        int b = 10;
        return "Sum is: " + (a + b);
    }
}`,
    python: `def main():
    a = 5
    b = 10
    print(f"Sum is: {a + b}")
    return "Python execution successful"

print(main())`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    int a = 5, b = 10;
    cout << "Sum is: " << (a + b) << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    int a = 5, b = 10;
    printf("Sum is: %d\\n", a + b);
    return 0;
}`
};

const JavaRunner = () => {
    const [language, setLanguage] = useState("java");
    const [code, setCode] = useState(codeTemplates.java);
    const [output, setOutput] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setCode(codeTemplates[newLang]);
        setOutput(null);
    };

    const runCode = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/algorithms/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Custom",
                    code,
                    language
                }),
            });

            const data = await response.json();
            if (data.status === "success") {
                setOutput(data.output);
                toast({ title: "✓ Success", description: `Your ${language.toUpperCase()} code ran perfectly.` });
            } else {
                setOutput(data.error || data.output);
                toast({ title: "⚠ Error", description: "Check terminal for details.", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            setOutput("Error connecting to backend. Ensure Spring Boot is running.");
            toast({ title: "Connection Error", description: "Backend might be offline.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl overflow-hidden border-border bg-card/40"
        >
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-border bg-muted/20 gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Code2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-foreground tracking-tight">Coding Playground</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Execute algorithms instantly</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-background/50 border border-border p-1 rounded-xl">
                        {['java', 'python', 'cpp', 'c'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => handleLanguageChange(lang)}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${language === lang
                                    ? "bg-primary text-primary-foreground shadow-glow"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={runCode}
                        disabled={loading}
                        className="h-10 px-6 gap-2 bg-primary text-primary-foreground font-bold hover:shadow-glow transition-all rounded-xl"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                        Run
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 border-r border-border space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            <ChevronRight className="h-3 w-3 text-primary" /> Editor
                        </div>
                        <div className="px-2 py-0.5 rounded bg-primary/10 text-[10px] text-primary font-bold uppercase tracking-widest">
                            {language === 'cpp' ? 'C++' : language}
                        </div>
                    </div>
                    <div className="relative group">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-[400px] lg:h-[350px] bg-background/30 border-border rounded-2xl p-6 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all resize-none shadow-inner"
                            placeholder={`Write your ${language} code here...`}
                        />
                    </div>
                </div>

                <div className="p-6 bg-muted/10 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <ChevronRight className="h-3 w-3 text-primary" /> Output Terminal
                    </div>
                    <div className="h-[400px] lg:h-[350px] rounded-2xl bg-black/90 p-6 font-mono text-sm overflow-auto shadow-2xl border border-white/5">
                        {output ? (
                            <pre className={`whitespace-pre-wrap leading-relaxed ${output?.toString().toLowerCase().includes("error") || output?.toString().toLowerCase().includes("exit code") ? "text-rose-400" : "text-emerald-400"}`}>
                                {`> ${language} execution\n`}
                                {output}
                            </pre>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-3">
                                <Terminal className="h-8 w-8 opacity-20" />
                                <span className="text-xs font-medium">Ready to execute code...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default JavaRunner;
