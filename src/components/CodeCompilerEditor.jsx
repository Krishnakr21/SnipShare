import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import { AppBar, Toolbar, Select, MenuItem, Button, Box, Typography, TextField, Paper, IconButton, Chip } from '@mui/material';
import { 
  Code, 
  ArrowBack, 
  Share, 
  FilePresent, 
  PlayArrow, 
  Stop,
  Save,
  FolderOpen,
  Settings
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { executeCode, isLanguageSupported } from '../utils/codeExecutor';

// Language templates
const getDefaultCode = (language) => {
  const templates = {
    python: 'print("Hello, World!")',
    java: `import java.util.*;
import java.io.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    javascript: 'console.log("Hello, World!");',
    typescript: 'console.log("Hello, World!");',
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    rust: `fn main() {
    println!("Hello, World!");
}`,
    php: `<?php
echo "Hello, World!";
?>`,
    ruby: 'puts "Hello, World!"',
  };
  
  return templates[language] || '';
};

const CodeCompilerEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const editorRef = useRef(null);
  const [fileName, setFileName] = useState('Untitled');

  // Load file if ID exists
  useEffect(() => {
    if (id) {
      loadFile();
    } else {
      // New file - set default
      setContent(getDefaultCode('python'));
    }
  }, [id]);

  const loadFile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const lang = data.language || 'python';
        setLanguage(lang);
        setFileName(data.file_name || id);
        
        const codeContent = data.language_content?.[lang] || getDefaultCode(lang);
        setContent(codeContent);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error('Failed to load file');
    }
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // Load default template for new language
    if (!content || content === getDefaultCode(language)) {
      setContent(getDefaultCode(newLang));
    }

    // Save language change if file exists
    if (id) {
      try {
        const { error } = await supabase
          .from('documents')
          .update({ language: newLang })
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  };

  const handleCodeChange = async (value) => {
    setContent(value);
    
    // Auto-save if file exists
    if (id) {
      try {
        const { data: currentDoc } = await supabase
          .from('documents')
          .select('language_content')
          .eq('id', id)
          .single();

        const updatedContent = {
          ...(currentDoc?.language_content || {}),
          [language]: value
        };

        await supabase
          .from('documents')
          .update({ 
            language_content: updatedContent,
            language: language 
          })
          .eq('id', id);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Executing code...');
    
    const startTime = Date.now();
    
    try {
      if (!isLanguageSupported(language)) {
        setOutput(`Language "${language}" is not supported for execution.`);
        return;
      }
      
      const result = await executeCode(language, content, input);
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      if (result.success) {
        const formattedOutput = `✅ Execution Successful\nTime: ${result.time}\nMemory: ${result.memory}\n\n${result.output}`;
        setOutput(formattedOutput);
        toast.success('Code executed successfully!');
      } else {
        setOutput(`❌ Execution Failed\n\n${result.error}`);
        toast.error('Execution failed');
      }
    } catch (error) {
      setOutput('❌ Error: ' + error.message);
      toast.error('Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleShareClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('URL copied to clipboard!'))
      .catch(() => toast.error('Failed to copy URL'));
  };

  const handleSave = async () => {
    if (!id) {
      toast.error('Please create a file first');
      return;
    }

    try {
      const { data: currentDoc } = await supabase
        .from('documents')
        .select('language_content')
        .eq('id', id)
        .single();

      const updatedContent = {
        ...(currentDoc?.language_content || {}),
        [language]: content
      };

      const { error } = await supabase
        .from('documents')
        .update({ 
          language_content: updatedContent,
          language: language,
          file_name: fileName
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('File saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save file');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toaster />
      
      {/* Top AppBar */}
      <AppBar position="static" sx={{ backgroundColor: '#000000', boxShadow: 'none' }}>
        <Toolbar sx={{ minHeight: '56px', gap: 2 }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
              <ArrowBack />
            </IconButton>
            
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {fileName}
            </Typography>

            <Select
              value={language}
              onChange={handleLanguageChange}
              size="small"
              sx={{
                backgroundColor: '#1A1A1A',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                minWidth: 120
              }}
            >
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
              <MenuItem value="c">C</MenuItem>
              <MenuItem value="csharp">C#</MenuItem>
              <MenuItem value="go">Go</MenuItem>
              <MenuItem value="rust">Rust</MenuItem>
              <MenuItem value="php">PHP</MenuItem>
              <MenuItem value="ruby">Ruby</MenuItem>
            </Select>
          </Box>

          {/* Center - Execution Status */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            {executionTime && (
              <Chip 
                label={`Last run: ${executionTime}ms`} 
                size="small"
                sx={{ backgroundColor: '#1A1A1A', color: '#4CAF50' }}
              />
            )}
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={isRunning ? <Stop /> : <PlayArrow />}
              onClick={handleRunCode}
              disabled={isRunning}
              sx={{
                backgroundColor: '#2563EB',
                '&:hover': { backgroundColor: '#1D4ED8' },
                '&:disabled': { backgroundColor: '#666' }
              }}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>

            <IconButton onClick={handleSave} sx={{ color: 'white' }}>
              <Save />
            </IconButton>

            <IconButton onClick={handleShareClick} sx={{ color: 'white' }}>
              <Share />
            </IconButton>

            <IconButton onClick={() => navigate('/files')} sx={{ color: 'white' }}>
              <FolderOpen />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Code Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
          <Editor
            height="100%"
            language={language}
            value={content}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </Box>

        {/* Right Panel - Input/Output */}
        <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column', backgroundColor: '#0A0A0A' }}>
          {/* Input Section */}
          <Box sx={{ flex: 1, p: 2, borderBottom: '1px solid #333' }}>
            <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>
              Input
            </Typography>
            <TextField
              multiline
              fullWidth
              rows={8}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here..."
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: '#1A1A1A',
                  color: 'white',
                  fontFamily: 'monospace',
                  fontSize: '13px'
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }
              }}
            />
            <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
              Provide input for your program (if needed)
            </Typography>
          </Box>

          {/* Output Section */}
          <Box sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>
              Output
            </Typography>
            <Paper
              sx={{
                backgroundColor: '#1A1A1A',
                color: '#E0E0E0',
                p: 2,
                height: 'calc(100% - 40px)',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '13px',
                whiteSpace: 'pre-wrap',
                border: '1px solid #333'
              }}
            >
              {output || 'Output will appear here...'}
            </Paper>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default CodeCompilerEditor;
