// Função corrigida para importData
const importData = async (data: ImportedData[] | string, date: string) => {
  try {
    let parsedData: ImportedData[];
    
    // Check if data is string (raw text) or already parsed
    if (typeof data === 'string') {
      parsedData = parseImportData(data, date);
    } else {
      parsedData = data;
    }
    
    if (parsedData.length === 0) {
      console.warn('No valid data found to import');
      return;
    }

    // CORREÇÃO: Buscar dados atuais do Firebase antes de verificar duplicatas
    const currentImportedData = await importedDataService.getAll();
    
    // Filter out duplicates before importing
    const uniqueData = checkForDuplicates(parsedData, currentImportedData);
    
    if (uniqueData.length === 0) {
      console.warn('No new data to import - all records already exist');
      return;
    }

    console.log(`Importing ${uniqueData.length} unique records out of ${parsedData.length} total records`);
    
    // Import only unique data
    await importDataToFirebase(uniqueData, date);
    
    // CORREÇÃO: Atualizar o estado local com os dados mais recentes
    const updatedImportedData = await importedDataService.getAll();
    setImportedData(updatedImportedData);
    
    console.log(`Successfully imported ${uniqueData.length} records`);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// Função corrigida para verificação de duplicatas
const checkForDuplicates = (newData: ImportedData[], existingData: ImportedData[]): ImportedData[] => {
  const uniqueData: ImportedData[] = [];
  
  // CORREÇÃO: Criar um Map para melhor performance e chaves mais específicas
  const existingKeysMap = new Map<string, boolean>();
  
  // Criar chaves únicas para dados existentes
  existingData.forEach(item => {
    // Usar múltiplas chaves para evitar falsos positivos
    const key1 = `${item.date}-${item.id}`;
    const key2 = `${item.date}-${item.route}-${item.weight}-${item.boxes}`;
    
    existingKeysMap.set(key1, true);
    existingKeysMap.set(key2, true);
  });

  for (const item of newData) {
    // Verificar se o item já existe usando diferentes critérios
    const key1 = `${item.date}-${item.id}`;
    const key2 = `${item.date}-${item.route}-${item.weight}-${item.boxes}`;
    
    // CORREÇÃO: Só considera duplicado se AMBAS as chaves existirem
    const isDuplicate = existingKeysMap.has(key1) && existingKeysMap.has(key2);
    
    if (!isDuplicate) {
      uniqueData.push(item);
      // Adicionar as chaves dos novos itens para evitar duplicatas dentro do mesmo lote
      existingKeysMap.set(key1, true);
      existingKeysMap.set(key2, true);
    } else {
      console.log('Duplicate data found and skipped:', {
        id: item.id,
        route: item.route,
        date: item.date
      });
    }
  }

  return uniqueData;
};

// Função corrigida para parseImportData - gerar IDs únicos
const parseImportData = (rawData: string, date: string): ImportedData[] => {
  const lines = rawData.split('\n').filter(line => line.trim() !== '');
  const parsedData: ImportedData[] = [];
  
  // Process each line to extract data
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip header lines and empty lines
    if (!line || 
        line.includes('Transporte SAP') || 
        line.includes('ROTAS') || 
        line.includes('PESO') || 
        line.includes('Caixas') ||
        line === '**ROTAS**' ||
        line === '**PESO**' ||
        line === '**Caixas**') {
      continue;
    }

    // Check if this line contains a route ID (numbers at the beginning)
    const routeMatch = line.match(/^(\d+)/);
    if (routeMatch) {
      const routeId = routeMatch[1];
      
      // Look for the route description in the same line or next lines
      let routeDescription = '';
      let weight = '';
      let boxes = '';
      
      // Try to extract from the same line
      const sameLineMatch = line.match(/^(\d+)\s+(.+?)(\d+[,.]?\d*)\s+(\d+)$/);
      if (sameLineMatch) {
        routeDescription = sameLineMatch[2].trim();
        weight = sameLineMatch[3].replace(',', '.');
        boxes = sameLineMatch[4];
      } else {
        // Route info might be spread across multiple lines
        // Look for route description in next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (!nextLine.match(/^\d+/) && nextLine.length > 0) {
            routeDescription = nextLine;
            i++; // Skip next line since we processed it
            
            // Look for weight and boxes in following lines
            if (i + 1 < lines.length) {
              const weightLine = lines[i + 1].trim();
              const weightMatch = weightLine.match(/(\d+[,.]?\d*)/);
              if (weightMatch) {
                weight = weightMatch[1].replace(',', '.');
                i++; // Skip weight line
                
                // Look for boxes in next line
                if (i + 1 < lines.length) {
                  const boxesLine = lines[i + 1].trim();
                  const boxesMatch = boxesLine.match(/(\d+)/);
                  if (boxesMatch) {
                    boxes = boxesMatch[1];
                    i++; // Skip boxes line
                  }
                }
              }
            }
          }
        }
      }

      // Create ImportedData object if we have the minimum required data
      if (routeId && routeDescription) {
        // CORREÇÃO: Gerar ID único para evitar conflitos
        const uniqueId = `${date}-${routeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const importedItem: ImportedData = {
          id: uniqueId, // ID único gerado
          date: date,
          route: routeDescription,
          weight: parseFloat(weight) || 0,
          boxes: parseInt(boxes) || 0,
          driverId: '', // Will be populated later based on route matching
          vehicleId: '', // Will be populated later based on route matching
          operationId: '', // Will be populated later
          routeId: routeId, // Manter o ID da rota original como campo separado
          // Add other required fields based on your ImportedData type
        };

        parsedData.push(importedItem);
      }
    }
  }

  console.log(`Parsed ${parsedData.length} records from import data`);
  return parsedData;
};
