import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { input } = await req.json()
    //console.log('🔒 Prompt Guard - Checking input:', input)

    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Prompt-Guard-86M",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: input }),
      }
    );

    const result = await response.json();
    //console.log('🔒 Prompt Guard - Raw response:', result)

    const jailbreakScore = result[0]?.find((r: any) => r.label === "JAILBREAK")?.score || 0;
    //console.log('🔒 Prompt Guard - Jailbreak score:', jailbreakScore)
    
    return NextResponse.json({ isMalicious: jailbreakScore > 0.5 });
  } catch (error) {
    //console.error('🔒 Prompt Guard - Error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      //console.error('🔒 Prompt Guard - Error name:', error.name);
      //console.error('🔒 Prompt Guard - Error message:', error.message);
      //console.error('🔒 Prompt Guard - Error stack:', error.stack);
    }
    return NextResponse.json({ isMalicious: false });
  }
} 