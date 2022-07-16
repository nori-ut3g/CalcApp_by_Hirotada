var app = new Vue({
  el: "#app",

  data: {
    input: "",
    formulaArr: [],
    formulaStr: "",
    result: "",
    nums: [9, 8, 7, 6, 5, 4, 3, 2, 1],
    signs: { "÷": true, "×": true, "－": true, "＋": true },
    debug:[]
  },

  created() {
    window.addEventListener('keydown', this.inputKey);
  },

  methods: {
    inputKey(e) {
      const inputKeyFunc = {
        "/": Object.keys(this.signs)[0],
        "*": Object.keys(this.signs)[1],
        "-": Object.keys(this.signs)[2],
        "+": Object.keys(this.signs)[3],
      }
      if (this.result != "") {
        this.clearResult();
      }
      // 数字またはゼロを入力した場合
      if (Number(e.key) || e.key == 0) {
        this.input = e.key;
        this.checkInput();
      }
      // 符号を入力した場合
      else if (typeof inputKeyFunc[e.key] != "undefined") {
        this.input = inputKeyFunc[e.key];
        this.checkInput();
      }
      // その他の処理
      else if (e.key == "Backspace") this.bsFormula();
      else if (e.key == "Escape") this.clearResult();
      else if (e.key == "Enter") this.checkFormula();
    },

    inputBtn(e) {
      this.input = e.currentTarget.innerText;
      this.checkInput();
    },

    checkInput() {
      if (this.result != "") {
        this.clearResult();
      }
      // 最初の入力はマイナスか数字のみ入力可能
      if (this.formulaArr.length == 0) {
        if (this.input == "－" || Number(this.input) || this.input == 0) {
          this.formulaArr.push(this.input);
        }
      }
      // 最初がマイナスの場合は数字のみ入力可能
      else if (this.formulaArr.length == 1 && this.formulaArr[0] == "－") {
        if (!Number(this.input)) {
          alert("ゼロ以外の数字を入力してください");
        } else {
          this.formulaArr[0] = "-" + this.input;
        }
      }
      else {
        const prevInput = this.formulaArr[this.formulaArr.length - 1];

        // 一つ前が符号で入力がマイナスの場合は半角にする
        if (this.signs[prevInput] && this.input == "－") {
          this.formulaArr.push("-");
        }
        // 一つ前が半角マイナスの場合
        else if (prevInput == "-") {
          // 入力が数字なら半角マイナスの後ろに追加する
          if (Number(this.input)) {
            this.formulaArr[this.formulaArr.length - 1] += this.input;
          }
          // 入力が符号なら差し替える
          else {
            this.formulaArr = this.formulaArr.slice(0, this.formulaArr.length - 2);
            this.formulaArr.push(this.input);
          }
        }
        // 一つ前が符号で入力も符号の場合は差し替える
        else if (this.signs[prevInput] && this.signs[this.input]) {
          this.formulaArr[this.formulaArr.length - 1] = this.input;
        }
        // 一つ前がゼロで入力が数字の場合は差し替える
        else if (prevInput == 0 && !this.signs[this.input]) {
          this.formulaArr[this.formulaArr.length - 1] = this.input;
        }
        // 一つ前が数値で入力も数値の場合は一つ前に追加する
        else if (!this.signs[prevInput] && !this.signs[this.input]) {
          this.formulaArr[this.formulaArr.length - 1] += this.input;
        }
        // それ以外（一方が符号で他方が数値）の場合は配列に追加する
        else {
          this.formulaArr.push(this.input);
        }
      }
      this.formulaStr = this.formulaArr.join(" ");
    },

    checkFormula() {
      // const leftParenthesesIndex = this.checkBrackets("(");
      // const rightParenthesesIndex = this.checkBrackets(")");

      const lastInput = this.formulaArr[this.formulaArr.length - 1];
      if (this.signs[lastInput] || lastInput == "-") alert("数式の最後を数字にしてください");
      else if (this.formulaArr.length == 0) alert("数式を入力してください");
      else this.calc();
    },

    // checkBrackets(lr) {
    //   const parenthesesIndex = [];

    //   for (let i = 0; i < this.formulaArr.length; i++) {
    //     if (this.formulaArr[i] === lr) parenthesesIndex.push(i);
    //   }

    //   return parenthesesIndex;
    // },

    calc() {
      this.result = this.calcNum;
      if (9 < this.result.toString().length) {
        this.result = Number(this.result).toExponential(8)
      }
    },
    
    bsFormula() {
      if (this.result != "") {
        this.clearResult();
      }
      this.formulaArr.splice(-1, 1);
      this.formulaStr = this.formulaArr.join(" ");
    },
    
    clearResult() {
      this.formulaArr = [];
      this.formulaStr = "";
      this.result = "";
    }
  },

  computed: {
    calcNum() {
      const temp = [];
      // ✕÷の位置を検索してtempに追加
      console.log(this.formulaArr)
      this.debug=this.formulaArr;
      for (let i = 1; i < this.formulaArr.length; i += 1) {
        if (this.formulaArr[i] == "×" || this.formulaArr[i] == "÷") temp.push(i);
      }

      // ✕÷を見つけたら乗算・除算を実行
      if (temp.length > 0) {
        for (let j = 0; j < temp.length; j++) {
          // 乗算の場合
          if (this.formulaArr[temp[j]] == "×") {
            this.formulaArr[temp[j] + 1] = Number(this.formulaArr[temp[j] - 1]) * Number(this.formulaArr[temp[j] + 1]);
            this.formulaArr[temp[j] - 1] = 0;
          }
          // 除算の場合
          else if (this.formulaArr[temp[j]] == "÷") {
            if (this.formulaArr[temp[j] + 1] == 0) return "Infinity";
            this.formulaArr[temp[j] + 1] = Number(this.formulaArr[temp[j] - 1]) / Number(this.formulaArr[temp[j] + 1]);
            this.formulaArr[temp[j] - 1] = 0;
          }
        }
      }

      // 残っているzero,✕,÷を取り除く
      const rmZero = this.formulaArr.filter(f => f !== 0);
      const rmZeroX = rmZero.filter(f => f !== "×");
      const rmZeroXSrash = rmZeroX.filter(f => f !== "÷");

      if (rmZeroXSrash.length == 0) return 0;
      if (rmZeroXSrash.length == 1) return rmZeroXSrash[0];

      // 加算・減算を実行
      for (let j = 0; j < rmZeroXSrash.length; j += 1) {
        if (rmZeroXSrash[j + 1] == 0) continue;
        if (rmZeroXSrash[j] == "＋") {
          rmZeroXSrash[j + 1] = Number(rmZeroXSrash[j - 1]) + Number(rmZeroXSrash[j + 1]);
          rmZeroXSrash[j - 1] = 0;
        } else if (rmZeroXSrash[j] == "－") {
          rmZeroXSrash[j + 1] = Number(rmZeroXSrash[j - 1]) - Number(rmZeroXSrash[j + 1]);
          rmZeroXSrash[j - 1] = 0;
        }
      }
      return rmZeroXSrash[rmZeroXSrash.length - 1]
    }
  }
})