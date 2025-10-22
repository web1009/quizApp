// Google Sheets CSV 서비스 (공개 시트용)
class GoogleSheetsService {
  constructor() {
    this.attendanceSheetId = '1u1JVtKlmLJyV4iwT15___Vsi7fBafMJvx5B_c2nAy1k';
    this.quizSheetId = '1KINLvdyI4a51yo-Sf90T1VAG5O8jFVmNDYIk4JMKQck';
  }

  // 출석부 데이터 가져오기 (Y로 시작하는 학생만)
  async getAttendanceData(date) {
    try {
      // CSV 형태로 데이터 가져오기
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${this.attendanceSheetId}/gviz/tq?tqx=out:csv&sheet=ZOOM`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      const rows = this.parseCSV(csvText);
      
      if (rows.length < 2) {
        return [];
      }

      // 헤더 행 찾기 (날짜가 있는 행) - 첫 번째 행이 날짜
      const headerRow = rows[0]; // 첫 번째 행이 날짜 헤더
      console.log('날짜 헤더 행:', headerRow);
      console.log('찾는 날짜:', date);
      
      const dateIndex = this.findDateColumnIndex(headerRow, date);
      console.log('찾은 날짜 인덱스:', dateIndex);
      
      if (dateIndex === -1) {
        console.log(`날짜 ${date}에 해당하는 컬럼을 찾을 수 없습니다.`);
        console.log('사용 가능한 날짜들:', headerRow.filter(cell => cell && this.isValidDate(cell)));
        return [];
      }

      // 학생 데이터 추출 (Y로 시작하는 학생만)
      const students = [];
      for (let i = 2; i < rows.length; i++) { // 3번째 행부터 데이터 (첫 행: 날짜, 둘째 행: 수강생명/수업참여시간)
        const row = rows[i];
        if (row.length > dateIndex) {
          const studentName = row[dateIndex];
          const attendanceTime = row[dateIndex + 1];
          
          // Y로 시작하는 학생만 필터링
          if (studentName && studentName.startsWith('Y')) {
            // Y코드와 이름 분리
            const nameParts = studentName.split(' ');
            const yCode = nameParts[0];
            const actualName = nameParts.slice(1).join(' ');
            
            students.push({
              id: yCode,
              fullName: studentName,
              name: actualName,
              attendanceTime: attendanceTime ? parseInt(attendanceTime, 10) : 0
            });
          }
        }
      }

      return students;
    } catch (error) {
      console.error('출석부 데이터 가져오기 실패:', error);
      throw error;
    }
  }

  // 퀴즈 응답 데이터 가져오기
  async getQuizResponses(date) {
    try {
      // 날짜를 시트 이름으로 사용하여 해당 날짜의 퀴즈 응답 시트 가져오기
      const sheetName = date; // 예: 2025-10-17
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${this.quizSheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      const rows = this.parseCSV(csvText);
      
      if (rows.length < 2) {
        console.log(`${date} 시트에 데이터가 없습니다.`);
        return [];
      }

      // 헤더 행 찾기
      const headerRow = rows[0];
      // 다양한 언어 헤더를 지원 (스페인어, 한국어, 영어)
      const lowerHeaders = headerRow.map(h => (h || '').toLowerCase());
      const findIdx = (pred) => lowerHeaders.findIndex(pred);

      const timestampIndex = findIdx(h => h.includes('타임스탬프') || h.includes('timestamp'));
      const yCodeIndex = findIdx(h => h.includes('código de clase') || h.includes('codigo de clase') || h.includes('코드'));
      const studentNameIndex = findIdx(h =>
        h.includes('nombre') || // 스페인어
        h.includes('학생명') || h.includes('이름') || // 한국어
        h.includes('name') // 영어
      );
      
      if (studentNameIndex === -1) {
        console.log(`${date} 시트에서 학생명 컬럼을 찾을 수 없습니다.`);
        return [];
      }

      // 퀴즈 응답 데이터 추출 (날짜별 시트이므로 날짜 필터링 불필요)
      const responses = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length > studentNameIndex && row[studentNameIndex]) {
          const studentName = row[studentNameIndex];
          const yCode = yCodeIndex !== -1 ? (row[yCodeIndex] || '') : '';
          const responseTime = timestampIndex !== -1 ? (row[timestampIndex] || '') : '';
          
          // 응답 데이터 수집 (C열=이름 이후의 컬럼만 포함 → 즉 D열부터)
          const responseData = {};
          const answers = [];
          headerRow.forEach((header, index) => {
            // 이름 컬럼보다 오른쪽(>)만 응답으로 간주
            if (index > studentNameIndex && header) {
              const value = row[index] || '';
              responseData[header] = value;
              answers.push(value);
            }
          });

          responses.push({
            studentName: studentName,
            yCode: yCode,
            responseTime: responseTime,
            responses: responseData,
            answers: answers
          });
        }
      }

      console.log(`${date} 시트에서 ${responses.length}개의 퀴즈 응답을 가져왔습니다.`);
      return responses;
    } catch (error) {
      console.error('퀴즈 응답 데이터 가져오기 실패:', error);
      throw error;
    }
  }

  // 날짜 컬럼 인덱스 찾기
  findDateColumnIndex(headerRow, targetDate) {
    for (let i = 0; i < headerRow.length; i++) {
      const cell = headerRow[i];
      if (cell && cell.trim() === targetDate) {
        return i;
      }
    }
    return -1;
  }

  // 컬럼 인덱스 찾기
  findColumnIndex(headerRow, searchText) {
    for (let i = 0; i < headerRow.length; i++) {
      const cell = headerRow[i];
      if (cell && cell.includes(searchText)) {
        return i;
      }
    }
    return -1;
  }

  // 사용 가능한 날짜 목록 가져오기
  async getAvailableDates() {
    try {
      // CSV 형태로 데이터 가져오기
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${this.attendanceSheetId}/gviz/tq?tqx=out:csv&sheet=ZOOM`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      const rows = this.parseCSV(csvText);
      
      if (rows.length < 2) {
        return [];
      }

      const headerRow = rows[0]; // 첫 번째 행이 날짜 헤더
      console.log('사용 가능한 날짜 찾기 - 헤더 행:', headerRow);
      
      const dates = [];
      
      for (let i = 0; i < headerRow.length; i++) {
        const cell = headerRow[i];
        if (cell && this.isValidDate(cell)) {
          dates.push(cell);
        }
      }
      
      console.log('찾은 날짜들:', dates);

      return dates;
    } catch (error) {
      console.error('사용 가능한 날짜 가져오기 실패:', error);
      return ['2025-10-17', '2025-10-21', '2025-10-24']; // 기본값
    }
  }

  // CSV 파싱 메서드
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const rows = [];
    
    for (let line of lines) {
      if (line.trim()) {
        const row = this.parseCSVLine(line);
        rows.push(row);
      }
    }
    
    return rows;
  }

  // CSV 라인 파싱 (쉼표로 분리, 따옴표 처리)
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // 유효한 날짜 형식인지 확인
  isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateString);
  }
}

export default new GoogleSheetsService();
