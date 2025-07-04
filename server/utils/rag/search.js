const { reqBody } = require("../http");

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = 'metabolicmd-mvp';
const location = 'us';              // Options: 'global', 'us', 'eu'
const collectionId = 'default_collection';     // Options: 'default_collection'
const dataStoreId = 'metmd-mvp-test-books_1751554800898'       // Create in Cloud Console
const servingConfigId = 'default_config';      // Options: 'default_config'
const engineId = 'metmd-mvp-test-books_1751554763883';
const sessionId = 'dsfjnsbfksdjkbfsdkfbsjkf';

const {SearchServiceClient} = require('@google-cloud/discoveryengine').v1beta;
const { ConversationalSearchServiceClient } = require('@google-cloud/discoveryengine').v1beta;

// For more information, refer to:
// https://cloud.google.com/generative-ai-app-builder/docs/locations#specify_a_multi-region_for_your_data_store
const apiEndpoint =
  location === 'global'
    ? 'discoveryengine.googleapis.com'
    : `${location}-discoveryengine.googleapis.com`;

// Instantiates a client
const client = new SearchServiceClient({apiEndpoint: apiEndpoint});
const conversationalClient = new ConversationalSearchServiceClient({apiEndpoint: apiEndpoint});

async function search(query) {
  // The full resource name of the search engine serving configuration.
  // Example: projects/{projectId}/locations/{location}/collections/{collectionId}/dataStores/{dataStoreId}/servingConfigs/{servingConfigId}
  // You must create a search engine in the Cloud Console first.
  const name = client.projectLocationCollectionDataStoreServingConfigPath(
    projectId,
    location,
    collectionId,
    dataStoreId,
    servingConfigId
  );

  const request = {
    pageSize: 10,
    query: query,
    servingConfig: name,
    contentSearchSpec: {
      summarySpec: {
        // The number of results to use for generating the summary
        summaryResultCount: 5,
        // Set to true to include citations in the summary
        includeCitations: true,
      },
    },
  };

  const IResponseParams = {
    ISearchResult: 0,
    ISearchRequest: 1,
    ISearchResponse: 2,
  };

  // Perform search request
  const response = await client.search(request, {
    // Warning: Should always disable autoPaginate to avoid iterate through all pages.
    //
    // By default NodeJS SDK returns an iterable where you can iterate through all
    // search results instead of only the limited number of results requested on
    // pageSize, by sending multiple sequential search requests page-by-page while
    // iterating, until it exhausts all the search results. This will be unexpected and
    // may cause high Search API usage and long wait time, especially when the matched
    // document numbers are huge.
    autoPaginate: false,
  });
  const results = response[IResponseParams.ISearchResponse].results;
  const summary = response[IResponseParams.ISearchResponse].summary;
  console.log("summary", summary);
  for (const result of results) {
    console.log(result);
  }
  
  return {"results": results, "summary": summary};
}

async function getConversationalAnswer(query) {
  // ZMIANA: Zamiast budować ścieżkę do servingConfig, budujemy ścieżkę do kolekcji konwersacji.
  // Myślnik '-' na końcu aktywuje tryb "auto-session", gdzie API samo zarządza sesją.
  const name = conversationalClient.projectLocationCollectionDataStoreConversationPath(
    projectId,
    location,
    collectionId,
    dataStoreId,
    '-' // Kluczowy element dla trybu auto-session
  );

  // ZMIANA: Budujemy osobno ścieżkę do servingConfig, aby przekazać ją jako parametr.
  const servingConfigPath = conversationalClient.projectLocationCollectionDataStoreServingConfigPath(
    projectId,
    location,
    collectionId,
    dataStoreId,
    servingConfigId
  );

  const request = {
    // ZMIANA: Głównym polem jest teraz `name`.
    name: `projects/${projectId}/locations/${location}/collections/${collectionId}/dataStores/${dataStoreId}/conversations/-`,

    // ZMIANA: `servingConfig` jest teraz parametrem wewnątrz żądania.
    // servingConfig: servingConfigPath,
    
    query: {
      text: query,
    },

    summarySpec: {
      summaryResultCount: 5,
      includeCitations: true,
      // Don't set maxExtractiveAnswerCount when using chunking config
    },
    // Enable safe search
    safeSearch: true,
    
    // W trybie auto-session, nie musimy przekazywać obiektu `conversation`.
    // API użyje `userPseudoId` do śledzenia użytkownika, jeśli go podamy.
    // Możemy użyć sessionId jako userPseudoId.
    // userPseudoId: sessionId || `session-${Math.random().toString(36).substring(7)}`,
  };

  console.log('Wysyłanie żądania konwersacji (nowa metoda):', JSON.stringify(request, null, 2));

  // Używamy `converseConversation`, tak jak to zrobiłeś.
  const [response] = await conversationalClient.converseConversation(request);

  const modelReply = response.answer;
  const searchResults = response.searchResults;

  console.log('--- Odpowiedź Modelu ---');
  console.log(modelReply);
  
  return { modelReply, searchResults };
}

async function getAnswerQuery(query) {
  // ZMIANA: Zamiast budować ścieżkę do servingConfig, budujemy ścieżkę do kolekcji konwersacji.
  // Myślnik '-' na końcu aktywuje tryb "auto-session", gdzie API samo zarządza sesją.
  const name = conversationalClient.projectLocationCollectionDataStoreConversationPath(
    projectId,
    location,
    collectionId,
    dataStoreId,
    '-' // Kluczowy element dla trybu auto-session
  );

  // ZMIANA: Budujemy osobno ścieżkę do servingConfig, aby przekazać ją jako parametr.
  const servingConfigPath = conversationalClient.projectLocationCollectionDataStoreServingConfigPath(
    projectId,
    location,
    collectionId,
    dataStoreId,
    servingConfigId
  );

  const request = {
    // ZMIANA: Głównym polem jest teraz `name`.
    servingConfig: `projects/${projectId}/locations/${location}/collections/${collectionId}/dataStores/${dataStoreId}/servingConfigs/${servingConfigId}`,

    // ZMIANA: `servingConfig` jest teraz parametrem wewnątrz żądania.
    // servingConfig: servingConfigPath,
    
    query: {
      text: query,
    },

    // summarySpec: {
    //   summaryResultCount: 5,
    //   includeCitations: true,
    //   // Don't set maxExtractiveAnswerCount when using chunking config
    // },
    // // Enable safe search
    // safeSearch: true,
    
    // W trybie auto-session, nie musimy przekazywać obiektu `conversation`.
    // API użyje `userPseudoId` do śledzenia użytkownika, jeśli go podamy.
    // Możemy użyć sessionId jako userPseudoId.
    // userPseudoId: sessionId || `session-${Math.random().toString(36).substring(7)}`,
  };
  console.log('Wysyłanie żądania konwersacji (nowa metoda):', JSON.stringify(request, null, 2));

  // Używamy `converseConversation`, tak jak to zrobiłeś.
  const [response] = await conversationalClient.answerQuery(request);

  const modelReply = response.answer;
  const searchResults = response.searchResults;

  console.log('--- Odpowiedź Modelu ---');
  console.log(modelReply);
  
  return { modelReply, searchResults };
}

const metabolicSearchMiddleware = async (request, response, next) => {
  try {
    const reqBody = request.body
    const message = typeof reqBody === 'string' ? JSON.parse(reqBody).message : reqBody.message;
    console.log("extracted message:", message);

    const answerQuery = await getAnswerQuery(message);
    console.log("answerQuery", answerQuery);

    // const convResponse = await getConversationalAnswer(message);
    // console.log("convResponse", convResponse);
    const results = await search(message);
    const summary = results.summary.summaryWithMetadata.summary;
    request.ragResults = summary;
    next();
  } catch (error) {
    console.log('Error in metabolic search middleware:', error);
    request.ragResults = [];
    next();
  }
}

module.exports = metabolicSearchMiddleware;