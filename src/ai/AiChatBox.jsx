import { useState } from 'react';

const AiChatBox = ({ onClose, userData }) => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const exampleQuestions = [
        "What’s a high-protein snack?",
        "How do I recover after a workout?",
        "What’s a good beginner workout?",
        "How many calories should I eat to lose weight?"
    ];

    const handleAskAI = async () => {
        setLoading(true);
        setResponse('');

        const requestData = {
            userGoal: userData.goal,
            userMacros: userData.macros,
            question
        };

        try {
            const token = localStorage.getItem('token');    
            const res = await fetch('http://localhost:5000/api/ai-recommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 
                            'Authorization': token
                 },
                body: JSON.stringify(requestData)
            });

            const data = await res.json();
            setResponse(data.message);
        } catch (error) {
            setResponse('❌ Failed to get advice from AI.');
            console.error('AI Request Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-lg rounded-lg border border-gray-300 z-50">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                <h3 className="text-lg font-semibold">💬 Fitto AI Coach</h3>
                <button onClick={onClose} className="text-white font-bold">X</button>
            </div>

            {/* Disclaimer */}
            <div className="p-3 text-sm text-gray-600 bg-gray-100">
                <p>🤖 Ask me fitness-related questions only!</p>
            </div>

            {/* Pre-filled Questions */}
            <div className="p-3">
                <p className="text-sm font-semibold mb-1">Try asking:</p>
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                    {exampleQuestions.map((q, index) => (
                        <li key={index}>
                            <button className="text-blue-600 underline" onClick={() => setQuestion(q)}>{q}</button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Question Input */}
            <div className="p-3 border-t">
                <textarea
                    className="w-full border p-2 rounded-md"
                    placeholder="Ask your fitness question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <button
                    onClick={handleAskAI}
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg"
                    disabled={loading || !question.trim()}
                >
                    {loading ? 'Thinking...' : 'Ask AI'}
                </button>
            </div>

            {/* AI Response */}
            {response && (
                <div className="p-3 border-t bg-gray-50">
                    <p className="text-sm font-semibold">🤖 AI Coach says:</p>
                    <p className="text-gray-700 mt-1">{response}</p>
                </div>
            )}
        </div>
    );
};

export default AiChatBox;
