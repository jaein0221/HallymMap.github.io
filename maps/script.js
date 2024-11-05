// 지도 생성 및 객체 리턴 (초기 위치를 한림대학교로 설정)
var mapContainer = document.getElementById('map'), 
    mapOption = { 
        center: new kakao.maps.LatLng(37.8865, 127.7354), // 한림대학교 중심 좌표
        level: 3 // 지도 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); 
var currentMarker = null; // 현재 표시된 마커
var currentImageIndex = 0;
var currentBuilding = null;
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
        currentBuilding = buildingInfo.building;
        setFloorIndex(buildingInfo.floor); // 층수에 맞는 인덱스 설정
    } else {
        searchResult.innerHTML = '해당 강의실 번호를 찾을 수 없습니다.';
    }
}

// 강의실 번호에 맞는 건물과 층수를 반환하는 함수
function getBuildingAndFloorFromClassroom(classroom) {
    var building = null;
    var floor = null;
    var mapBuilding = null;

    classroom = classroom.split('-')[0];
    var cleanedClassroom = classroom.replace('B', '');

    if (cleanedClassroom.length === 4) {
        if (cleanedClassroom.startsWith('1')) { building = '1'; mapBuilding = '한림대학교 공학관'; }
        else if (cleanedClassroom.startsWith('2')) { building = '2'; mapBuilding = '한림대학교 인문1관'; }
        else if (cleanedClassroom.startsWith('3')) { building = '3'; mapBuilding = '한림대학교 의학관'; }
        else if (cleanedClassroom.startsWith('4')) { building = '4'; mapBuilding = '한림대학교 인문2관'; }
        else if (cleanedClassroom.startsWith('5')) { building = '5'; mapBuilding = '한림대학교 대학본부별관'; }
        else if (cleanedClassroom.startsWith('7')) { building = '7'; mapBuilding = '한림대학교 자연과학관'; }
        else if (cleanedClassroom.startsWith('8')) { building = '8'; mapBuilding = '한림대학교 생명과학관'; }
        else if (cleanedClassroom.startsWith('9')) { building = '9'; mapBuilding = '한림대학교 캠퍼스 라이프 센터'; }
        floor = classroom.charAt(1) === 'B' ? `지하 ${classroom.charAt(2)}층` : `${classroom.charAt(1)}층`;
    } else if (cleanedClassroom.length === 5) {
        if (cleanedClassroom.startsWith('10')) { building = '10'; mapBuilding = '한림대학교 사회경영1관'; }
        else if (cleanedClassroom.startsWith('A1') || cleanedClassroom.startsWith('a1')) { building = '1'; mapBuilding = '한림대학교 공학관'; }
        else if (cleanedClassroom.startsWith('13')) { building = '13'; mapBuilding = '한림대학교 사회경영2관'; }
        else if (cleanedClassroom.startsWith('14')) { building = '14'; mapBuilding = '한림대학교 국제회의관'; }
        else if (cleanedClassroom.startsWith('16')) { building = '16'; mapBuilding = '한림대학교 기초교육관'; }
        else if (cleanedClassroom.startsWith('22')) { building = '22'; mapBuilding = '한림대학교 산학협력관'; }
        floor = classroom.charAt(2) === 'B' ? `지하 ${classroom.charAt(3)}층` : `${classroom.charAt(2)}층`;
    }

    if (classroom.charAt(0).toUpperCase() === 'B') {
        building = '10';
        mapBuilding = '한림대학교 사회경영1관';
        floor = `지하 ${classroom.charAt(1)}층`;
    }

    return { building, mapBuilding, floor };
}

// 층수에 맞는 이미지 인덱스 설정 함수
function setFloorIndex(floor) {
    var floorMap = { '1층': 0, '2층': 1, '3층': 2, '4층': 3, '5층': 4, '6층': 5, '지하 1층': 6, '지하 2층': 7 };
    currentImageIndex = floorMap[floor] || 0;
}

// 지도에서 검색한 건물 찾기
function findBuildingOnMap(mapBuildingName) {
    var places = new kakao.maps.services.Places();
    
    if (currentMarker) currentMarker.setMap(null);

    places.keywordSearch(mapBuildingName, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            currentMarker = new kakao.maps.Marker({ map, position: coords });
            map.setCenter(coords);

            // 마커 클릭 시 이미지를 보여주는 이벤트 리스너 추가
            kakao.maps.event.addListener(currentMarker, 'click', function() {
                showImageModal(); // 마커 클릭 시 이미지 모달 띄우기
            });
        } else {
            alert('해당 건물을 지도에서 찾을 수 없습니다.');
        }
    });
}

// 이미지를 화면에 표시하는 함수
function displayImage() {
    if (currentImages.length > 0) {
        const imageElement = document.getElementById('imageDisplay');
        imageElement.src = `maps/images/${currentBuilding}/${currentImages[currentImageIndex]}.png`;
    } else {
        console.error("No images found to display.");
    }
}

// 이미지 모달 표시 함수
function showImageModal() {
    displayImage();
    document.getElementById('imageModal').style.display = 'block';
}

// 이전 버튼 클릭 시 호출
function prevImage() {
    if (currentImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        displayImage();
    }
}

// 다음 버튼 클릭 시 호출
function nextImage() {
    if (currentImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        displayImage();
    }
}

// 닫기 버튼 클릭 시 호출
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}
