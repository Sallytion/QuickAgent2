'use client'
import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function Home() {
  const [shortPrompt, setShortPrompt] = React.useState("");
  const [responseText, setResponseText] = React.useState("");
  const [imageData, setImageData] = React.useState("");
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [temp, setTemp] = React.useState(true);

  async function handleClick() {
    const response = await fetch("https://krishna-api-bd7ab3334389.herokuapp.com/prompter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: process.env.NEXT_PUBLIC_PROMPTER_TOKEN,
        shortPrompt,
      }),
    });
    const data = await response.json();
    console.log("Response data:", data);
    setResponseText(data.elaboratedPrompt || "");
    setTemp(true);
  }

  async function handleGenerateImage() {
    setIsGeneratingImage(true);
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
        { inputs: responseText },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_IMAGE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );
      // Convert the arraybuffer to a Base64 string
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(response.data))
      );
      setImageData(base64);
    } catch (error) {
      console.error("Error generating image:", error);
    }
    setIsGeneratingImage(false);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
      <Input
        placeholder="enter prompt"
        value={shortPrompt}
        onChange={(e) => setShortPrompt(e.target.value)}
      />
      <Button onClick={handleClick}>create prompt</Button>
      {temp && (
        <div>
          <Textarea
            value={responseText}
            onChange={(e) => {
              setResponseText(e.target.value);
              console.log(responseText);
            }}
          />
          <Button onClick={handleGenerateImage} disabled={isGeneratingImage}>
            {isGeneratingImage ? "Generating..." : "generate image"}
          </Button>
          {imageData && (
            <Image
              src={`data:image/png;base64,${imageData}`}
              alt="Generated image"
              width={1024}
              height={1024}
            />
          )}
        </div>
      )}
    </div>
  );
}