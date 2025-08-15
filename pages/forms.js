import { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      const data = await response.json();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms</h1>
        <p className="text-gray-600">Access and complete required forms.</p>
      </div>

      <div className="grid gap-6">
        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms available</h3>
            <p className="text-gray-600">Check back later for new forms.</p>
          </div>
        ) : (
          forms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {form.title.rendered}
                    </h3>
                    {form.acf?.type && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {form.acf.type}
                      </span>
                    )}
                  </div>
                  
                  {form.acf?.form_link && (
                    <a
                      href={form.acf.form_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open Form</span>
                    </a>
                  )}
                </div>
                
                {form.content?.rendered && (
                  <div 
                    className="text-gray-700 mb-4"
                    dangerouslySetInnerHTML={{ __html: form.content.rendered }}
                  />
                )}
                
                {form.acf?.form_link && (
                  <div className="border-t pt-4">
                    <iframe
                      src={form.acf.form_link}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      className="rounded-lg"
                      title={form.title.rendered}
                    >
                      Loading form...
                    </iframe>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
