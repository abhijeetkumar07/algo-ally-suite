import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Github, Linkedin, ArrowLeft, Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Connect = () => {
    const [searchParams] = useSearchParams();
    const provider = searchParams.get("provider") as "github" | "linkedin" | null;
    const navigate = useNavigate();
    const { toast } = useToast();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (!provider) navigate("/dashboard");
    }, [provider, navigate]);

    const handleConnect = async () => {
        if (!username.trim()) return;
        setLoading(true);

        try {
            // First fetch existing profile
            const getRes = await fetch("/api/profiles/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!getRes.ok) throw new Error("Failed to fetch profile");
            const profile = await getRes.json();

            // Update respective field
            const updatedProfile = { ...profile };
            if (provider === "github") {
                updatedProfile.githubUsername = username.trim();
            } else if (provider === "linkedin") {
                updatedProfile.linkedinUsername = username.trim();
            }

            const response = await fetch("/api/profiles/me", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedProfile)
            });

            if (!response.ok) throw new Error("Failed to save connection");

            toast({
                title: `${provider === 'github' ? 'GitHub' : 'LinkedIn'} Connected!`,
                description: "Your professional profile has been linked.",
            });

            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error: any) {
            toast({
                title: "Connection Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </button>

                <div className="glass rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 mx-auto">
                        {provider === "github" ? (
                            <Github className="h-8 w-8 text-primary" />
                        ) : (
                            <Linkedin className="h-8 w-8 text-primary" />
                        )}
                    </div>

                    <h1 className="text-2xl font-display font-bold text-center text-foreground mb-2">
                        Connect {provider === "github" ? "GitHub" : "LinkedIn"}
                    </h1>
                    <p className="text-center text-muted-foreground mb-8">
                        Link your professional presence to showcase your achievements.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {provider === "github" ? "GitHub Username" : "LinkedIn Profile Handle"}
                            </label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={provider === "github" ? "e.g. pranjal123" : "e.g. pranjal-sharma-123"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 h-12"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleConnect}
                            disabled={loading || !username.trim()}
                            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Link Account"
                            )}
                        </Button>
                    </div>

                    <p className="mt-6 text-xs text-center text-muted-foreground">
                        PlacementGPT will fetch your public profile data to display on your dashboard.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Connect;
