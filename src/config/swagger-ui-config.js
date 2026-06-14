/**
 * Configuration personnalisée pour Swagger UI
 */

const swaggerUiConfig = {
  customCss: `
    .swagger-ui .topbar { 
      background-color: #1a202c; 
    }
    .swagger-ui .topbar .download-url-wrapper { 
      display: none; 
    }
    .swagger-ui .info .title { 
      color: #2d3748; 
      font-size: 2.5rem;
      font-weight: bold;
    }
    .swagger-ui .info .description { 
      font-size: 1rem;
      line-height: 1.6;
    }
    .swagger-ui .scheme-container { 
      background-color: #f7fafc; 
      border: 1px solid #e2e8f0;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    .swagger-ui .opblock-tag { 
      border-bottom: 2px solid #e2e8f0;
      padding: 1rem 0;
    }
    .swagger-ui .opblock-tag:hover { 
      background-color: #f7fafc;
    }
    .swagger-ui .opblock .opblock-summary-method { 
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 0.25rem;
      padding: 0.5rem 0.75rem;
    }
    .swagger-ui .opblock .opblock-summary-path { 
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
    .swagger-ui .opblock.opblock-post { 
      border-color: #48bb78;
      background-color: rgba(72, 187, 120, 0.05);
    }
    .swagger-ui .opblock.opblock-get { 
      border-color: #4299e1;
      background-color: rgba(66, 153, 225, 0.05);
    }
    .swagger-ui .opblock.opblock-put { 
      border-color: #ed8936;
      background-color: rgba(237, 137, 54, 0.05);
    }
    .swagger-ui .opblock.opblock-delete { 
      border-color: #f56565;
      background-color: rgba(245, 101, 101, 0.05);
    }
    .swagger-ui .opblock.opblock-patch { 
      border-color: #9f7aea;
      background-color: rgba(159, 122, 234, 0.05);
    }
    .swagger-ui .btn.authorize { 
      background-color: #4299e1;
      border-color: #4299e1;
      color: white;
      font-weight: bold;
    }
    .swagger-ui .btn.authorize:hover { 
      background-color: #3182ce;
    }
    .swagger-ui .btn.execute { 
      background-color: #48bb78;
      border-color: #48bb78;
      color: white;
    }
    .swagger-ui .btn.execute:hover { 
      background-color: #38a169;
    }
    .swagger-ui .response-col_status { 
      font-size: 1.2rem;
      font-weight: bold;
    }
    .swagger-ui .response-col_status.response-200 { 
      color: #48bb78;
    }
    .swagger-ui .response-col_status.response-201 { 
      color: #48bb78;
    }
    .swagger-ui .response-col_status.response-400 { 
      color: #ed8936;
    }
    .swagger-ui .response-col_status.response-401 { 
      color: #f56565;
    }
    .swagger-ui .response-col_status.response-403 { 
      color: #f56565;
    }
    .swagger-ui .response-col_status.response-404 { 
      color: #ed8936;
    }
    .swagger-ui .response-col_status.response-500 { 
      color: #e53e3e;
    }
    
    /* Badge personnalisé pour les tags */
    .swagger-ui .opblock-tag small { 
      background-color: #edf2f7;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 600;
      color: #4a5568;
      margin-left: 0.5rem;
    }
    
    /* Style pour les schémas */
    .swagger-ui .model-box { 
      background-color: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
    }
    
    /* Message d'accueil personnalisé */
    .swagger-ui .information-container::before {
      content: "👋 Bienvenue sur l'API Dahira App";
      display: block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
    }
  `,
  customSiteTitle: 'Dahira App API - Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    docExpansion: 'list',
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    deepLinking: true,
    displayOperationId: false,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai'
    }
  }
};

module.exports = swaggerUiConfig;
