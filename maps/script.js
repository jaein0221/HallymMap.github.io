// 지도 생성 및 객체 리턴 (초기 위치를 한림대학교로 설정)
var mapContainer = document.getElementById('map'), 
    mapOption = { 
        center: new kakao.maps.LatLng(37.8865, 127.7354), // 한림대학교 중심 좌표
        level: 3 // 지도 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); 
var currentMarker = null; // 현재 표시된 마커
var currentImageIndex = 0;
var currentImages = ['1', '2', '3', '4', '5', '6', 'B1', 'B2']; // 이미지 배열 초기화

// 강의실 검색 함수
function findClassroom() {
    var classroom = document.getElementById('classroom').value.split('-')[0]; // '-' 전까지만 사용
    var searchResult = document.getElementById('search-result');
    
    if (!classroom) {
        alert('강의실 번호를 입력하세요.');
        return;
    }

    var buildingInfo = getBuildingAndFloorFromClassroom(classroom);
    if (buildingInfo && buildingInfo.building) {
        searchResult.innerHTML = `검색된 건물: ${buildingInfo.building}, 층수: ${buildingInfo.floor}`;
        findBuildingOnMap(buildingInfo.mapBuilding);  // 지도에 사용될 건물 이름으로 검색
        showImagesForFloor(buildingInfo.building, buildingInfo.floor); // 해당 층에 맞는 이미지 표시
    } else {
        searchResult.innerHTML = '해당 강의실 번호를 찾을 수 없습니다.';
    }
}

// 강의실 번호에 맞는 건물과 층수를 반환하는 함수
function getBuildingAndFloorFromClassroom(classroom) {
    var building = null;
    var floor = null;
    var mapBuilding = null;

    // '-'가 포함된 강의실 번호 처리
    classroom = classroom.split('-')[0];

    // 'B'가 포함된 경우 'B'를 제외하고 자리수 계산
    var cleanedClassroom = classroom.replace('B', '');

    // 자리수에 따라 건물 및 층수 구분
    if (cleanedClassroom.length === 4) {
        if (cleanedClassroom.startsWith('1')) {
            building = '1'; // 공학관
            mapBuilding = '한림대학교 공학관';
        } else if (cleanedClassroom.startsWith('2')) {
            building = '2'; // 인문1관
            mapBuilding = '한림대학교 인문1관';
        } else if (cleanedClassroom.startsWith('3')) {
            building = '3'; // 의학관
            mapBuilding = '한림대학교 의학관';
        } else if (cleanedClassroom.startsWith('4')) {
            building = '4'; // 인문2관
            mapBuilding = '한림대학교 인문2관';
        } else if (cleanedClassroom.startsWith('5')) {
            building = '5'; // 대학본부별관
            mapBuilding = '한림대학교 대학본부별관';
        } else if (cleanedClassroom.startsWith('7')) {
            building = '7'; // 자연과학관
            mapBuilding = '한림대학교 자연과학관';
        } else if (cleanedClassroom.startsWith('8')) {
            building = '8'; // 생명과학관
            mapBuilding = '한림대학교 생명과학관';
        } else if (cleanedClassroom.startsWith('9')) {
            building = '9'; // 캠퍼스 라이프 센터
            mapBuilding = '한림대학교 캠퍼스 라이프 센터';
        }
    
        // 층수 처리
        if (classroom.charAt(1).toUpperCase() === 'B') {
            floor = `지하 ${classroom.charAt(2)}층`; // 'B'로 시작하면 지하
        } else {
            floor = `${classroom.charAt(1)}층`; // 두 번째 숫자가 층수
        }
    } else if (cleanedClassroom.length === 5) {
        if (cleanedClassroom.startsWith('10')) {
            building = '10'; // 사회경영1관 폴더 이름
            mapBuilding = '한림대학교 사회경영1관';
        }else if (cleanedClassroom.startsWith('A1')) {
            building = '1'; // 공학관
            mapBuilding = '한림대학교 공학관';
        }else if (cleanedClassroom.startsWith('a1')) {
            building = '1'; // 공학관
            mapBuilding = '한림대학교 공학관';
        }else if (cleanedClassroom.startsWith('13')) {
            building = '13'; // 사회경영2관 폴더 이름
            mapBuilding = '한림대학교 사회경영2관';
        } else if (cleanedClassroom.startsWith('14')) {
            building = '14'; // 국제회의관 폴더 이름
            mapBuilding = '한림대학교 국제회의관';
        } else if (cleanedClassroom.startsWith('16')) {
            building = '16'; // 기초교육관 폴더 이름
            mapBuilding = '한림대학교 기초교육관';
        } else if (cleanedClassroom.startsWith('22')) {
            building = '22'; // 산학협력관 폴더 이름
            mapBuilding = '한림대학교 산학협력관';
        } 
    
        // 'B'가 아닌 경우 정상적인 층수 처리
        if (classroom.charAt(2).toUpperCase() === 'B') {
            floor = `지하 ${classroom.charAt(3)}층`; // 'B'가 있으면 지하층 처리
        } else {
            floor = `${classroom.charAt(2)}층`; // 세 번째 숫자가 층수
        }
    }

    // 예외적으로 B로 시작하면 사회경영1관 지하층으로 처리
    if (classroom.charAt(0).toUpperCase() === 'B') {
        building = '10'; // 사회경영1관으로 매칭
        mapBuilding = '한림대학교 사회경영1관';
        floor = `지하 ${classroom.charAt(1)}층`;
    }

    return {
        building: building,
        mapBuilding: mapBuilding,
        floor: floor
    };
}

// 지도에서 검색한 건물 찾기
function findBuildingOnMap(mapBuildingName) {
    var places = new kakao.maps.services.Places();
    
    // 이전 마커가 있으면 제거
    if (currentMarker) {
        currentMarker.setMap(null);
    }

    places.keywordSearch(mapBuildingName, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            currentMarker = new kakao.maps.Marker({
                map: map,
                position: coords
            });
            map.setCenter(coords);

            // 지도에서 검색된 위치에 마커 표시
        } else {
            alert('해당 건물을 지도에서 찾을 수 없습니다.');
        }
    });
}

// 해당 층에 맞는 이미지를 보여주는 함수
function showImagesForFloor(building, floor) {
    currentBuilding = building; // 현재 선택된 건물 저장
    var floorMap = {
        '1층': 0, '2층': 1, '3층': 2, '4층': 3, '5층': 4, '6층': 5, '지하 1층': 6, '지하 2층': 7
    };

    currentImageIndex = floorMap[floor] || 0; // 층수에 맞는 배열 인덱스 설정

    if (currentImages.length > 0) {
        displayImage(); // 이미지 바로 표시
        document.getElementById('imageModal').style.display = 'block'; // 팝업 창 띄우기
    }
}

// 이미지를 화면에 표시하는 함수
function displayImage() {
    if (currentImages.length > 0) {
        const imageElement = document.getElementById('imageDisplay');
        
        // building 폴더 추가하여 이미지 경로 설정
        imageElement.src = `maps/images/${currentBuilding}/${currentImages[currentImageIndex]}.png`;
        console.log("Displaying image:", `maps/images/${currentBuilding}/${currentImages[currentImageIndex]}.png`);
    } else {
        console.error("No images found to display.");
    }
}

// 이전 버튼 클릭 시 호출
function prevImage() {
    if (currentImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length; // 이전 이미지로 이동 (순환)
        console.log("Previous image index:", currentImageIndex);
        displayImage();
    } else {
        console.error("No images available for prevImage.");
    }
}

// 다음 버튼 클릭 시 호출
function nextImage() {
    if (currentImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length; // 다음 이미지로 이동 (순환)
        console.log("Next image index:", currentImageIndex);
        displayImage();
    } else {
        console.error("No images available for nextImage.");
    }
}

// 닫기 버튼 클릭 시 호출
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}
