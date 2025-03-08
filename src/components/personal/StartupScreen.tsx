import { useState, useEffect } from "react";

const StartupScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentImage, setCurrentImage] = useState<"first" | "second">("first");
  const [bootProgress, setBootProgress] = useState(0);
  const [bootMessages, setBootMessages] = useState<string[]>([]);

  useEffect(() => {
    // Linux-like boot messages
    const messages = [
      "Starting kernel...",
      "Mounting filesystems...",
      "Starting system services...",
      "Initializing network interfaces...",
      "Loading user preferences...",
      "Starting X server...",
      "Launching desktop environment..."
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setBootMessages(prev => [...prev, messages[messageIndex]]);
        messageIndex++;
      } else {
        clearInterval(messageInterval);
        setCurrentImage("second");
      }
    }, 300);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setBootProgress(prev => {
        const newProgress = prev + 2;
        return newProgress <= 100 ? newProgress : 100;
      });
    }, 100);

    const messageTimeout = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(messageTimeout);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "#121212",
        backgroundImage: "radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)",
      }}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-3xl">
        {currentImage === "first" && (
          <div className="font-mono text-green-500 text-sm w-full max-w-xl bg-black bg-opacity-90 p-6 rounded-md border border-gray-800 shadow-lg">
            {bootMessages.map((message, index) => (
              <div key={index} className="mb-1">
                <span className="text-green-300 mr-2">[OK]</span> {message}
              </div>
            ))}
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-6 mb-2 overflow-hidden">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${bootProgress}%` }}
              ></div>
            </div>
            <div className="text-gray-500 text-xs text-right mt-1">
              {Math.min(bootProgress, 99)}%
            </div>
          </div>
        )}
        {currentImage === "second" && (
          <div className="text-center bg-black bg-opacity-90 p-8 rounded-md border border-gray-800 shadow-lg">
            <pre className="text-green-500 text-xs sm:text-sm md:text-base font-mono">
{`
  █████╗ ███╗   ██╗██████╗ ██████╗ ███████╗██╗    ██╗███████╗
 ██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔════╝██║    ██║██╔════╝
 ███████║██╔██╗ ██║██║  ██║██████╔╝█████╗  ██║ █╗ ██║███████╗
 ██╔══██║██║╚██╗██║██║  ██║██╔══██╗██╔══╝  ██║███╗██║╚════██║
 ██║  ██║██║ ╚████║██████╔╝██║  ██║███████╗╚███╔███╔╝███████║
 ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚══════╝
                                                              
 ██████╗ ██╗ ██████╗ ██╗████████╗ █████╗ ██╗                 
 ██╔══██╗██║██╔════╝ ██║╚══██╔══╝██╔══██╗██║                 
 ██║  ██║██║██║  ███╗██║   ██║   ███████║██║                 
 ██║  ██║██║██║   ██║██║   ██║   ██╔══██║██║                 
 ██████╔╝██║╚██████╔╝██║   ██║   ██║  ██║███████╗            
 ╚═════╝ ╚═╝ ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝            
                                                              
  ██████╗  █████╗ ██████╗ ██████╗ ███████╗███╗   ██╗         
 ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝████╗  ██║         
 ██║  ███╗███████║██████╔╝██║  ██║█████╗  ██╔██╗ ██║         
 ██║   ██║██╔══██║██╔══██╗██║  ██║██╔══╝  ██║╚██╗██║         
 ╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗██║ ╚████║         
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝         
`}
            </pre>
            <p className="text-gray-300 mt-6 mb-3">Version 1.0.0</p>
            <div className="w-64 bg-gray-800 rounded-full h-2.5 mb-4 mx-auto overflow-hidden">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${bootProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm">Loading environment...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupScreen;
