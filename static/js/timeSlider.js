const inputLeft = document.getElementById("input-left");
const inputRight = document.getElementById("input-right");

const thumbLeft = document.querySelector(".slider > .thumb.left");
const thumbRight = document.querySelector(".slider > .thumb.right");
const range = document.querySelector(".slider > .range");

const setLeftValue = () => {
  const _this = inputLeft;
  const [min, max] = [parseInt(_this.min), parseInt(_this.max)];
  
  // 교차되지 않게, 1을 빼준 건 완전히 겹치기보다는 어느 정도 간격을 남겨두기 위해.
  _this.value = Math.min(parseInt(_this.value), parseInt(inputRight.value) - 1);
  
  // input, thumb 같이 움직이도록
  thumbLeft.style.left = (_this.value - min) * 7.375 + "px";
  range.style.left = (_this.value - min) * 7.375 + "px";
};

const setRightValue = () => {
  const _this = inputRight;
  const [min, max] = [parseInt(_this.min), parseInt(_this.max)];
  
  // 교차되지 않게, 1을 더해준 건 완전히 겹치기보다는 어느 정도 간격을 남겨두기 위해.
  _this.value = Math.max(parseInt(_this.value), parseInt(inputLeft.value) + 1);
  
  // input, thumb 같이 움직이도록
  thumbRight.style.right = 177 - ((_this.value - min) * 7.375) + "px";
  range.style.right = 177 - ((_this.value - min) * 7.375) + "px";
};

inputLeft.addEventListener("input", setLeftValue);
inputRight.addEventListener("input", setRightValue);

var output = document.getElementById("sTime");

inputLeft.oninput = function() {
    if (this.value < 10) {
        if(inputRight.value >= 10) {
            output.innerHTML = '0' + this.value + ':00 - ' + inputRight.value + ':00';
        }
        else {
            output.innerHTML = '0' + this.value + ':00 - 0' + inputRight.value + ':00';
        }
    }
    else {
        output.innerHTML = this.value + ':00 - ' + inputRight.value + ':00';
    }
}

inputRight.oninput = function() {
    if (inputLeft.value < 10) {
        if(this.value >= 10) {
            output.innerHTML = '0' + inputLeft.value + ':00 - ' + this.value + ':00';
        }
        else {
            output.innerHTML = '0' + inputLeft.value + ':00 - 0' + this.value + ':00';
        }
    }
    else {
        output.innerHTML = inputLeft.value + ':00 - ' + this.value + ':00';
    }
}