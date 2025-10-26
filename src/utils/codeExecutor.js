/**
 * Code execution utility using Piston API
 * Supports multiple programming languages
 */

const languageMap = {
  javascript: { piston: "javascript", ext: "js", version: "18.15.0" },
  python: { piston: "python", ext: "py", version: "3.10.0" },
  java: { piston: "java", ext: "java", version: "15.0.2" },
  cpp: { piston: "cpp", ext: "cpp", version: "10.2.0" },
  c: { piston: "c", ext: "c", version: "10.2.0" },
  csharp: { piston: "csharp", ext: "cs", version: "6.12.0" },
  ruby: { piston: "ruby", ext: "rb", version: "3.0.1" },
  go: { piston: "go", ext: "go", version: "1.16.2" },
  rust: { piston: "rust", ext: "rs", version: "1.68.2" },
  typescript: { piston: "typescript", ext: "ts", version: "5.0.3" },
  php: { piston: "php", ext: "php", version: "8.2.3" },
};

/**
 * Execute code using Piston API
 * @param {string} language - Programming language
 * @param {string} code - Source code to execute
 * @param {string} input - Standard input for the program
 * @returns {Promise<Object>} Execution result with output, error, time, and memory
 */
export async function executeCode(language, code, input = "") {
  const meta = languageMap[language];
  
  if (!meta) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
      output: "",
      time: "0ms",
      memory: "0KB"
    };
  }

  // Process code for specific languages
  let processedCode = code;
  let processedInput = input;

  if (language === "java") {
    // Replace any public class declaration with Main
    processedCode = code.replace(/public\s+class\s+\w+/g, "public class Main");

    // Ensure input ends with newline for Scanner
    if (processedInput && !processedInput.endsWith("\n")) {
      processedInput = processedInput + "\n";
    }
  }

  const payload = {
    language: meta.piston,
    version: meta.version || "*",
    files: [{ name: `main.${meta.ext}`, content: processedCode }],
    stdin: processedInput,
    compile_timeout: 10000,
    run_timeout: 5000,
    compile_memory_limit: -1,
    run_memory_limit: -1,
  };

  try {
    const startTime = Date.now();
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SnipShare/1.0",
      },
      body: JSON.stringify(payload),
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (!res.ok) {
      return {
        success: false,
        error: `Remote service error ${res.status}: ${res.statusText}`,
        output: "",
        time: `${executionTime}ms`,
        memory: "0KB"
      };
    }

    const data = await res.json();
    console.log("Piston response:", data);

    // Handle compilation errors
    if (data.compile && data.compile.code !== 0) {
      return {
        success: false,
        error: `Compilation Error:\n${data.compile.stderr || data.compile.output || "Unknown compilation error"}`,
        output: "",
        time: `${executionTime}ms`,
        memory: "0KB"
      };
    }

    // Handle runtime
    const { run } = data;
    if (run.code === 0) {
      return {
        success: true,
        output: run.stdout || run.output || "Program executed successfully (no output)",
        error: "",
        time: `${executionTime}ms`,
        memory: "N/A" // Piston doesn't provide memory info
      };
    }

    // Better error handling for common exceptions
    let errorMessage = run.stderr || run.output || `Process exited with code ${run.code}`;

    if (errorMessage.includes("NoSuchElementException")) {
      errorMessage = `❌ Input Missing Error:
Your code is trying to read input, but no input was provided.

🔧 Quick fixes:
1. Add input in the "Input" section below the code editor
2. For two integers, try: "5 10" or "5\\n10"
3. Make sure you provide enough input values for all Scanner.nextInt() calls

Original error:
${errorMessage}`;
    } else if (errorMessage.includes("InputMismatchException")) {
      errorMessage = `❌ Input Format Error: 
${errorMessage}

💡 Common fixes:
- For integers: Use space or newline separation (e.g., "5 10" or "5\\n10")
- For arrays: Put size on first line, elements on second line
- Check if your input matches what Scanner expects`;
    }

    return {
      success: false,
      error: errorMessage,
      output: "",
      time: `${executionTime}ms`,
      memory: "N/A"
    };
  } catch (error) {
    console.error("Piston execution error:", error);
    return {
      success: false,
      error: "Network error: Failed to connect to execution service",
      output: "",
      time: "0ms",
      memory: "0KB"
    };
  }
}

/**
 * Get list of supported languages
 * @returns {Array<string>} Array of supported language names
 */
export function getSupportedLanguages() {
  return Object.keys(languageMap);
}

/**
 * Check if a language is supported
 * @param {string} language - Language to check
 * @returns {boolean} True if language is supported
 */
export function isLanguageSupported(language) {
  return language in languageMap;
}
