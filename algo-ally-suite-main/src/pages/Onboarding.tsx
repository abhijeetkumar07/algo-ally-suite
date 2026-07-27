import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, GraduationCap, Code2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const techOptions = ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "React", "Node.js"];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [targetCompanyType, setTargetCompanyType] = useState("Product");
  const [dsaLevel, setDsaLevel] = useState("Beginner");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  // LeetCode Stats
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [leetcodeEasy, setLeetcodeEasy] = useState("0");
  const [leetcodeMedium, setLeetcodeMedium] = useState("0");
  const [leetcodeHard, setLeetcodeHard] = useState("0");
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinUsername, setLinkedinUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) navigate("/auth");
    loadExistingProfile();
  }, [token]);

  const loadExistingProfile = async () => {
    try {
      const res = await fetch("/api/profiles/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFullName(data.fullName || "");
        setCollege(data.college || "");
        setDegree(data.degree || "");
        setGraduationYear(data.graduationYear?.toString() || "");
        setTargetCompanyType(data.targetCompanyType || "Product");
        setDsaLevel(data.dsaLevel || "Beginner");
        setSelectedTech(data.preferredTechStack || []);
        setLeetcodeUsername(data.leetcodeUsername || "");
        setLeetcodeEasy(data.leetcodeEasy?.toString() || "0");
        setLeetcodeMedium(data.leetcodeMedium?.toString() || "0");
        setLeetcodeHard(data.leetcodeHard?.toString() || "0");
        setGithubUsername(data.githubUsername || "");
        setLinkedinUsername(data.linkedinUsername || "");
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profiles/me", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          college,
          degree,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          targetCompanyType,
          dsaLevel,
          preferredTechStack: selectedTech,
          onboardingCompleted: true,
          leetcodeUsername,
          leetcodeEasy: parseInt(leetcodeEasy),
          leetcodeMedium: parseInt(leetcodeMedium),
          leetcodeHard: parseInt(leetcodeHard),
          githubUsername,
          linkedinUsername,
        })
      });

      if (!response.ok) throw new Error("Failed to save profile");

      toast({ title: "Profile Updated", description: "Your journey settings have been saved." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    // Step 0: Personal info
    <div key="personal" className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="bg-background/50" />
      </div>
      <div className="space-y-2">
        <Label>College / University</Label>
        <Input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="IIT Delhi" className="bg-background/50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Degree</Label>
          <Input value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="B.Tech CSE" className="bg-background/50" />
        </div>
        <div className="space-y-2">
          <Label>Graduation Year</Label>
          <Input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="2026" type="number" className="bg-background/50" />
        </div>
      </div>
    </div>,

    // Step 1: Preferences
    <div key="preferences" className="space-y-6">
      <div className="space-y-2">
        <Label>Target Company Type</Label>
        <Select value={targetCompanyType} onValueChange={setTargetCompanyType}>
          <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="FAANG">FAANG</SelectItem>
            <SelectItem value="Product">Product Based</SelectItem>
            <SelectItem value="Service">Service Based</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>DSA Level</Label>
        <Select value={dsaLevel} onValueChange={setDsaLevel}>
          <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner (Zero to Hero)</SelectItem>
            <SelectItem value="Intermediate">Intermediate (Consistency is key)</SelectItem>
            <SelectItem value="Advanced">Advanced (Contest Ready)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>,

    // Step 2: Tech Stack
    <div key="tech" className="space-y-4">
      <Label>Select Preferred Technologies</Label>
      <div className="grid grid-cols-3 gap-3">
        {techOptions.map((tech) => (
          <button
            key={tech}
            onClick={() => toggleTech(tech)}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${selectedTech.includes(tech)
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
              : "bg-background/50 border-border hover:border-primary/50"
              }`}
          >
            {tech}
          </button>
        ))}
      </div>
    </div>,

    // Step 3: LeetCode Stats
    <div key="leetcode" className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Code2 className="h-5 w-5 text-orange-500" />
        <Label>LeetCode Profile Statistics</Label>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">LeetCode Username</Label>
          <Input value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)} placeholder="e.g. jdoe_coder" className="bg-background/50" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-[10px] text-green-500 font-bold uppercase">Easy</Label>
            <Input value={leetcodeEasy} onChange={(e) => setLeetcodeEasy(e.target.value)} type="number" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-orange-500 font-bold uppercase">Medium</Label>
            <Input value={leetcodeMedium} onChange={(e) => setLeetcodeMedium(e.target.value)} type="number" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-red-500 font-bold uppercase">Hard</Label>
            <Input value={leetcodeHard} onChange={(e) => setLeetcodeHard(e.target.value)} type="number" className="bg-background/50" />
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">Manual sync allows you to track progress from local H2 database.</p>
    </div>
  ];

  const totalSteps = steps.length;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-6 right-6">
        <Button
          variant="ghost"
          onClick={logout}
          className="text-muted-foreground hover:text-destructive flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Complete Profile</h1>
          <p className="text-muted-foreground">Help us personalize your preparation journey</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl shadow-primary/5">
          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-border/30"
                  }`}
              />
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[250px]"
          >
            {steps[step]}
          </motion.div>

          <div className="flex gap-4 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 bg-background/50">
                Back
              </Button>
            )}
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              onClick={() => (step === totalSteps - 1 ? handleComplete() : setStep(step + 1))}
              disabled={loading}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  {step === totalSteps - 1 ? "Complete Setup" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
