"use client";

import { useEffect, useRef, useState } from "react";
import { VolumeX, CloudRain, Wind } from "lucide-react";

type SoundOption = "none" | "rain" | "whitenoise";

interface SoundConfig {
  id: SoundOption;
  label: string;
  file: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SOUND_OPTIONS: SoundConfig[] = [
  { id: "none", label: "None", file: "", Icon: VolumeX },
  { id: "rain", label: "Rain", file: "/sounds/rain.mp3", Icon: CloudRain },
  { id: "whitenoise", label: "White Noise", file: "/sounds/whitenoise.mp3", Icon: Wind },
];

export function AmbientPlayer() {
  const [selectedSound, setSelectedSound] = useState<SoundOption>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState<Set<SoundOption>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrent = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSelect = (id: SoundOption) => {
    stopCurrent();
    setSelectedSound(id);

    if (id === "none") return;

    const option = SOUND_OPTIONS.find((s) => s.id === id);
    if (!option?.file) return;

    try {
      const audio = new Audio(option.file);
      audio.loop = true;
      audio.volume = 0.4;

      audio.addEventListener("error", () => {
        setUnavailable((prev) => new Set(prev).add(id));
        setIsPlaying(false);
        audioRef.current = null;
      });

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setUnavailable((prev) => new Set(prev).add(id));
          setIsPlaying(false);
          audioRef.current = null;
        });

      audioRef.current = audio;
    } catch {
      setUnavailable((prev) => new Set(prev).add(id));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return stopCurrent;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#8888AA]">
        Ambient Sound
      </p>
      <div className="flex items-center gap-2">
        {SOUND_OPTIONS.map(({ id, label, Icon }) => {
          const isActive = selectedSound === id;
          const notAvailable = unavailable.has(id);

          return (
            <button
              key={id}
              onClick={() => !notAvailable && handleSelect(id)}
              disabled={notAvailable && id !== "none"}
              title={notAvailable ? "Sound file not found" : label}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                isActive
                  ? {
                      borderColor: "rgba(0,212,255,0.4)",
                      backgroundColor: "rgba(0,212,255,0.1)",
                      color: "#00D4FF",
                    }
                  : {
                      borderColor: "rgba(255,255,255,0.06)",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      color: "#8888AA",
                    }
              }
            >
              <Icon size={13} />
              <span>{label}</span>
              {notAvailable && id !== "none" && (
                <span className="ml-1 text-[#FF3366]" title="Sound file not found">
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
      {isPlaying && selectedSound !== "none" && (
        <p className="text-[10px] font-mono text-[#00FF88]/60 tracking-wider">
          ● playing
        </p>
      )}
    </div>
  );
}
