// 이름 정규화 함수 (악센트 제거, 소문자화, 앞뒤 공백 제거, 모든 공백 제거)
function normalizeName(name) {
  if (!name) return '';
  
  // 악센트 제거 (유니코드 정규화)
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // 소문자화, 앞뒤 공백 제거, 그리고 모든 공백 제거
  return normalized.toLowerCase().trim().replace(/\s+/g, '');
}

// 더 정교한 이름 정규화 함수 (악센트 제거 + 대소문자 통일)
function normalizeNameAdvanced(name) {
  if (!name) return '';
  
  // 악센트 제거 (유니코드 정규화)
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // 소문자화, 앞뒤 공백 제거, 그리고 모든 공백 제거
  return normalized.toLowerCase().trim().replace(/\s+/g, '');
}

// 이름 비교 함수 (악센트 무시, 대소문자 무시)
function compareNames(name1, name2) {
  if (!name1 || !name2) return false;
  
  const norm1 = normalizeNameAdvanced(name1);
  const norm2 = normalizeNameAdvanced(name2);
  
  return norm1 === norm2;
}

// 출석부에서 Y코드 제거하고 이름만 추출하는 함수 (현재 사용하지 않음)
// function extractNameFromAttendance(fullName) {
//   if (!fullName) return '';
//   
//   // Y코드가 포함된 경우 (예: "Y33 Karla patricia gaitan cabrera")
//   if (fullName.startsWith('Y')) {
//     const parts = fullName.split(' ');
//     return parts.slice(1).join(' '); // Y코드 제거하고 나머지 부분만 반환
//   }
//   
//   return fullName; // Y코드가 없는 경우 전체 이름 반환
// }

// 간단한 이름 매칭 함수 (대소문자 무시, 공백 무시)
function isNameMatch(name1, name2) {
  if (!name1 || !name2) return false;
  
  // 두 이름을 모두 정규화
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);
  
  return norm1 === norm2;
}

// 부분 이름 매칭 함수 (첫 번째 이름이 두 번째 이름에 포함되는지 확인)
function isPartialNameMatch(name1, name2) {
  if (!name1 || !name2) return false;
  
  // 두 이름을 모두 정규화
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);
  
  // 첫 번째 이름이 두 번째 이름에 포함되는지 확인
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true;
  }
  
  // 각 이름을 단어로 분리하여 비교
  const words1 = norm1.split(/\s+/).filter(word => word.length > 2); // 2글자 이상만
  const words2 = norm2.split(/\s+/).filter(word => word.length > 2);
  
  // 공통 단어가 2개 이상이면 매칭
  const commonWords = words1.filter(word1 => 
    words2.some(word2 => word1 === word2)
  );
  
  return commonWords.length >= 2;
}

export const compareAttendanceAndQuiz = (attendanceStudents, quizResponses) => {
  console.log('=== 퀴즈 매칭 시작 ===');
  console.log('출석 학생 수:', attendanceStudents.length);
  console.log('퀴즈 응답 수:', quizResponses.length);
  
  const normalizeBasic = (s) => normalizeNameAdvanced(String(s || ''));
  const stripYCode = (s) => String(s || '').replace(/^y\d+\s+/i, '').trim();
  const normalizeKeepSpaces = (s) => {
    if (s == null) return '';
    return String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[.,]/g, '') // 점과 쉼표 제거
      .replace(/\s+/g, ' ');
  };
  
  // 더 강력한 정규화: Y코드와 이름 사이의 공백 정리
  const normalizeYCodeName = (s) => {
    const cleaned = String(s || '').trim();
    // Y05 ronny orlando zambrana chamorro -> y05 ronny orlando zambrana chamorro
    return cleaned.replace(/^(y\d+)\s+(.+)$/i, (match, yCode, name) => {
      return `${yCode.toLowerCase()} ${name.trim()}`;
    });
  };
  
  // 인덱스 준비: yCode, 정규화된 이름, 정규화된 전체이름(Y코드+이름)
  const yCodeToResponse = new Map();
  const nameToResponses = new Map();
  const fullNameToResponse = new Map();

  quizResponses.forEach(r => {
    const y = (r.yCode || '').toString().trim().toLowerCase();
    const n = normalizeBasic(r.studentName);
    const combinedFullName = normalizeBasic(`${r.yCode || ''} ${r.studentName || ''}`.trim());
    if (y) yCodeToResponse.set(y, r);
    if (!nameToResponses.has(n)) nameToResponses.set(n, []);
    nameToResponses.get(n).push(r);
    if (combinedFullName) fullNameToResponse.set(combinedFullName, r);
  });
  
  console.log('퀴즈 응답자 Y코드들:', Array.from(yCodeToResponse.keys()));
  console.log('퀴즈 응답자 이름들:', quizResponses.map(r => r.studentName));

  const pickBestByName = (studentNameNorm) => {
    // 1) 정확 일치
    const exactList = nameToResponses.get(studentNameNorm);
    if (exactList && exactList.length > 0) return exactList[0];
    // 2) 포함/부분 일치
    for (const [key, list] of nameToResponses.entries()) {
      if (key.includes(studentNameNorm) || studentNameNorm.includes(key)) {
        return list[0];
      }
    }
    return null;
  };

  // 토큰화 및 점수 계산 (동일 Y코드 내에서 가장 유사한 응답 선택)
  const tokenize = (s) => normalizeKeepSpaces(s).split(' ').filter(Boolean);
  const scoreOverlap = (attTokens, quizTokens) => {
    if (attTokens.length === 0 || quizTokens.length === 0) return 0;
    const setQ = new Set(quizTokens);
    let match = 0;
    for (const t of attTokens) {
      if (setQ.has(t)) match++;
    }
    // 정밀도와 재현율 가중 평균 비슷하게 점수화
    const precision = match / quizTokens.length;
    const recall = match / attTokens.length;
    return (precision * 0.4) + (recall * 0.6) + (match >= 2 ? 0.1 : 0); // 최소 2토큰 보너스
  };

  // 더 유연한 이름 매칭 (부분 일치, 중간 이름 무시)
  const flexibleNameMatch = (name1, name2) => {
    const norm1 = normalizeKeepSpaces(name1);
    const norm2 = normalizeKeepSpaces(name2);
    
    // 정확 일치
    if (norm1 === norm2) return true;
    
    // 토큰화
    const tokens1 = norm1.split(' ').filter(t => t.length > 1);
    const tokens2 = norm2.split(' ').filter(t => t.length > 1);
    
    // 첫 토큰(이름)과 마지막 토큰(성)이 일치하면 매칭
    if (tokens1.length >= 2 && tokens2.length >= 2) {
      const first1 = tokens1[0];
      const last1 = tokens1[tokens1.length - 1];
      const first2 = tokens2[0];
      const last2 = tokens2[tokens2.length - 1];
      
      if (first1 === first2 && last1 === last2) {
          return true;
        }
      }
      
    // 부분 포함 관계 (한쪽이 다른 쪽을 포함)
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
        return true;
      }
      
    // 공통 토큰이 2개 이상
    const commonTokens = tokens1.filter(t => tokens2.includes(t));
    return commonTokens.length >= 2;
  };

  // 동일 응답 중복 사용 방지용 키
  const makeRespKey = (r) => {
    const y = (r.yCode || '').toString().trim().toLowerCase();
    const n = normalizeBasic(r.studentName || '');
    const t = (r.responseTime || '').toString();
    return `${y}|${n}|${t}`;
  };
  const usedResponses = new Set();

  // Y코드별 응답 그룹
  const responsesByY = new Map();
  quizResponses.forEach(r => {
    const y = (r.yCode || '').toString().trim().toLowerCase();
    if (!responsesByY.has(y)) responsesByY.set(y, []);
    responsesByY.get(y).push(r);
  });

  const results = attendanceStudents.map(student => {
    const fullName = student.fullName || '';
    const nameNoY = stripYCode(student.name || fullName);
    const studentNorm = normalizeBasic(nameNoY);
    const studentY = (student.id || '').toString().trim().toLowerCase(); // e.g., y02
    const attendanceFullNorm = normalizeBasic(fullName);
    const attendanceYCodeName = normalizeYCodeName(fullName); // Y05 ronny orlando zambrana chamorro -> y05 ronny orlando zambrana chamorro
    
    console.log(`🔍 매칭 시도: "${fullName}" (Y코드: ${studentY})`);

    // 1) Y코드 우선 매칭
    let matched = null;
    // 동일 Y코드 내 후보들 중 이름 토큰 유사도 최고를 선택 (응답 재사용 방지)
    if (studentY && responsesByY.has(studentY)) {
      const candidates = responsesByY.get(studentY).filter(r => !usedResponses.has(makeRespKey(r)));
      if (candidates.length > 0) {
        const attTokens = tokenize(nameNoY);
        let best = null;
        let bestScore = -1;
        for (const r of candidates) {
          const score = scoreOverlap(attTokens, tokenize(r.studentName));
          if (score > bestScore) {
            bestScore = score;
            best = r;
          }
        }
        // 임계치: 첫 토큰(이름) 일치 필수 + 출석 토큰의 60% 이상 또는 3토큰 이상 일치
        const minRecall = attTokens.length > 0 ? Math.ceil(attTokens.length * 0.6) : 0;
        const quizTokensBest = best ? tokenize(best.studentName) : [];
        const overlapCount = attTokens.filter(t => new Set(quizTokensBest).has(t)).length;
        const firstTokenMatch = attTokens.length > 0 && quizTokensBest.length > 0 && attTokens[0] === quizTokensBest[0];
        // 짧은 이름(<=2토큰)은 모든 토큰 포함 + 첫 토큰 일치 요구
        const shortNameOk = attTokens.length <= 2
          ? firstTokenMatch && overlapCount === attTokens.length
          : firstTokenMatch && overlapCount >= Math.max(2, minRecall);
        if (best && shortNameOk) {
          matched = best;
          usedResponses.add(makeRespKey(best));
          console.log(`✅ 동일 Y코드 내 토큰 매칭 성공 (score=${bestScore.toFixed(2)} overlap=${overlapCount})`);
        }
      }
    }

    // 2) 출석부 전체이름(예: "Y02 Estefanía")과 퀴즈(Y02 + 이름) 결합 정확 매칭
    if (!matched) {
      const byFull = fullNameToResponse.get(attendanceFullNorm);
      if (byFull && !usedResponses.has(makeRespKey(byFull))) {
        matched = byFull;
        usedResponses.add(makeRespKey(byFull));
        console.log(`✅ 전체이름 정규화 매칭 성공`);
      }
    }
    
    // 2.5) Y코드+이름 정규화 매칭 (대소문자 무시)
    if (!matched) {
      const attendanceYCodeNameNorm = normalizeBasic(attendanceYCodeName);
      const byYCodeName = fullNameToResponse.get(attendanceYCodeNameNorm);
      if (byYCodeName && !usedResponses.has(makeRespKey(byYCodeName))) {
        matched = byYCodeName;
        usedResponses.add(makeRespKey(byYCodeName));
        console.log(`✅ Y코드+이름 정규화 매칭 성공: "${attendanceYCodeName}" -> "${attendanceYCodeNameNorm}"`);
      }
    }

    // 3) 이름 정규화 정확/부분 매칭 (Y코드 무관하게 전체에서 검색)
    if (!matched) {
      // Y코드가 달라도 이름이 일치하면 매칭 (Y01 vs Y18 같은 경우)
      const candidates = [];
      for (const list of responsesByY.values()) {
        candidates.push(...list.filter(r => !usedResponses.has(makeRespKey(r))));
      }

      const studentNormLocal = studentNorm;
      let best = null;
      let bestScore = -1;
      const attTokens = tokenize(nameNoY);
      
      // 1단계: 유연한 이름 매칭 시도
      for (const r of candidates) {
        console.log(`🔍 유연한 매칭 시도: "${nameNoY}" vs "${r.studentName}"`);
        if (flexibleNameMatch(nameNoY, r.studentName)) {
          console.log(`✅ 유연한 매칭 성공: "${nameNoY}" ↔ "${r.studentName}"`);
          best = r;
          bestScore = 1;
          break;
        }
      }
      
      // 2단계: 토큰 기반 점수 매칭
      if (!best) {
        for (const r of candidates) {
          const n = normalizeBasic(r.studentName);
          if (n === studentNormLocal) {
            best = r;
            bestScore = 1;
            break;
          }
          const score = scoreOverlap(attTokens, tokenize(r.studentName));
          if (score > bestScore) {
            bestScore = score;
            best = r;
          }
        }
      }
      
      // 3단계: 임계치 확인
      if (best) {
        const quizTokensBest = tokenize(best.studentName);
        const overlapCount = attTokens.filter(t => new Set(quizTokensBest).has(t)).length;
        const minRecall = attTokens.length > 0 ? Math.ceil(attTokens.length * 0.6) : 0;
        const firstTokenMatch = attTokens.length > 0 && quizTokensBest.length > 0 && attTokens[0] === quizTokensBest[0];
        const shortNameOk = attTokens.length <= 2
          ? firstTokenMatch && overlapCount === attTokens.length
          : firstTokenMatch && overlapCount >= Math.max(2, minRecall);
        
        // 유연한 매칭이거나 임계치를 만족하면 매칭 성공
        if (bestScore === 1 || shortNameOk) {
          matched = best;
          usedResponses.add(makeRespKey(best));
          console.log(`✅ 이름 매칭 성공 (Y코드 무관): "${studentNormLocal}" -> "${best.studentName}" (overlap=${overlapCount})`);
        }
      }
    }
    
    if (!matched) {
      console.log(`❌ 매칭 실패: "${fullName}"`);
    }

    return {
      student: student,
      attended: true,
      quizResponded: !!matched,
      quizData: matched || null,
      checked: false
    };
  });
  
  return results;
};

export const normalizeStudentName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .replace(/[^\w\s가-힣]/g, ''); // 특수문자 제거 (한글, 영문, 숫자, 공백만 유지)
};

export const findMatchingStudent = (studentName, quizResponses) => {
  const normalizedStudentName = normalizeStudentName(studentName);
  
  return quizResponses.find(response => {
    const normalizedResponseName = normalizeStudentName(response.studentName);
    
    // 정확한 매칭
    if (normalizedStudentName === normalizedResponseName) {
      return true;
    }
    
    // 부분 매칭 (한쪽이 다른 쪽을 포함하는 경우)
    if (normalizedStudentName.includes(normalizedResponseName) || 
        normalizedResponseName.includes(normalizedStudentName)) {
      return true;
    }
    
    // 성과 이름으로 분리해서 매칭
    const studentParts = normalizedStudentName.split(' ');
    const responseParts = normalizedResponseName.split(' ');
    
    // 성이 같은 경우
    if (studentParts[0] === responseParts[0] && studentParts[0].length > 1) {
      return true;
    }
    
    // 이름이 같은 경우
    if (studentParts.length > 1 && responseParts.length > 1) {
      if (studentParts[1] === responseParts[1] && studentParts[1].length > 1) {
        return true;
      }
    }
    
    return false;
  });
};

export const calculateResponseRate = (results) => {
  if (results.length === 0) return 0;
  const respondedCount = results.filter(result => result.quizResponded).length;
  return Math.round((respondedCount / results.length) * 100);
};

export const getStatistics = (results) => {
  const totalStudents = results.length;
  const respondedStudents = results.filter(result => result.quizResponded).length;
  const notRespondedStudents = totalStudents - respondedStudents;
  const responseRate = calculateResponseRate(results);

  return {
    totalStudents,
    respondedStudents,
    notRespondedStudents,
    responseRate
  };
};

// 이름 정렬 함수 추가
export const sortStudentsByName = (students) => {
  return students.sort((a, b) => {
    const nameA = a.student.fullName || '';
    const nameB = b.student.fullName || '';
    
    // 영어로 시작하는 이름인지 확인
    const isEnglishA = /^[A-Za-z]/.test(nameA);
    const isEnglishB = /^[A-Za-z]/.test(nameB);
    
    // Y로 시작하는 코드인지 확인
    const isYA = /^Y\d+/.test(nameA);
    const isYB = /^Y\d+/.test(nameB);
    
    // 정렬 우선순위: 영어 -> Y
    if (isEnglishA && !isEnglishB) return -1;
    if (!isEnglishA && isEnglishB) return 1;
    
    if (isYA && !isYB) return -1;
    if (!isYA && isYB) return 1;
    
    // 같은 카테고리 내에서 정렬
    if (isEnglishA && isEnglishB) {
      // 영어 이름은 알파벳 순으로 정렬
      return nameA.localeCompare(nameB);
    }
    
    if (isYA && isYB) {
      // Y 코드는 숫자 순으로 정렬
      const matchA = nameA.match(/Y(\d+)/);
      const matchB = nameB.match(/Y(\d+)/);
      const numA = parseInt(matchA ? matchA[1] : '0');
      const numB = parseInt(matchB ? matchB[1] : '0');
      return numA - numB;
    }
    
    
    // 기본적으로 알파벳 순으로 정렬
    return nameA.localeCompare(nameB);
  });
};
