/*
 * コレクション型メソッド データ定義
 * --------------------------------
 * 各メソッドは以下の構造を持つ:
 *   type        : 所属する型 (list / dict / set / tuple / str)
 *   name        : メソッド名
 *   signature   : 呼び出し形式
 *   category    : 分類 (追加 / 削除 / 参照 / 集合演算 ...)
 *   mutating    : 元のオブジェクトを変更するか (true / false)
 *   returns     : 戻り値の説明
 *   description : 動作の説明 (クイズ「動作当て」の正解文)
 *   example     : サンプルコード
 *   result      : example の出力結果 (クイズ「出力予想」で使用)
 *
 * データとロジックを分離しているため、ここに追記するだけで出題範囲が広がります。
 */

window.METHOD_DATA = [
  /* ===================== list ===================== */
  { type: "list", name: "append", signature: "list.append(x)", category: "追加", mutating: true, returns: "None",
    description: "末尾に要素を1つ追加する", example: "lst = [1, 2]\nlst.append(3)\nprint(lst)", result: "[1, 2, 3]" },
  { type: "list", name: "extend", signature: "list.extend(iterable)", category: "追加", mutating: true, returns: "None",
    description: "別のイテラブルの要素を末尾に連結する", example: "lst = [1, 2]\nlst.extend([3, 4])\nprint(lst)", result: "[1, 2, 3, 4]" },
  { type: "list", name: "insert", signature: "list.insert(i, x)", category: "追加", mutating: true, returns: "None",
    description: "指定位置 i に要素 x を挿入する", example: "lst = [1, 3]\nlst.insert(1, 2)\nprint(lst)", result: "[1, 2, 3]" },
  { type: "list", name: "remove", signature: "list.remove(x)", category: "削除", mutating: true, returns: "None",
    description: "最初に一致した要素 x を削除する", example: "lst = [1, 2, 2]\nlst.remove(2)\nprint(lst)", result: "[1, 2]" },
  { type: "list", name: "pop", signature: "list.pop([i])", category: "削除", mutating: true, returns: "削除した要素",
    description: "指定位置の要素を削除して返す(省略時は末尾)", example: "lst = [1, 2, 3]\nx = lst.pop()\nprint(x)", result: "3" },
  { type: "list", name: "clear", signature: "list.clear()", category: "削除", mutating: true, returns: "None",
    description: "全ての要素を削除して空にする", example: "lst = [1, 2, 3]\nlst.clear()\nprint(lst)", result: "[]" },
  { type: "list", name: "index", signature: "list.index(x)", category: "参照", mutating: false, returns: "位置(int)",
    description: "要素 x が最初に現れる位置を返す", example: "lst = [10, 20, 30]\nprint(lst.index(20))", result: "1" },
  { type: "list", name: "count", signature: "list.count(x)", category: "参照", mutating: false, returns: "出現回数(int)",
    description: "要素 x の出現回数を返す", example: "lst = [1, 2, 2, 3]\nprint(lst.count(2))", result: "2" },
  { type: "list", name: "sort", signature: "list.sort(key=None, reverse=False)", category: "並べ替え", mutating: true, returns: "None",
    description: "リストをその場で昇順(または指定順)に並べ替える", example: "lst = [3, 1, 2]\nlst.sort()\nprint(lst)", result: "[1, 2, 3]" },
  { type: "list", name: "reverse", signature: "list.reverse()", category: "並べ替え", mutating: true, returns: "None",
    description: "要素の並びをその場で逆順にする", example: "lst = [1, 2, 3]\nlst.reverse()\nprint(lst)", result: "[3, 2, 1]" },
  { type: "list", name: "copy", signature: "list.copy()", category: "コピー", mutating: false, returns: "新しいリスト",
    description: "浅いコピーを新しいリストとして返す", example: "lst = [1, 2]\nnew = lst.copy()\nprint(new)", result: "[1, 2]" },

  /* ===================== dict ===================== */
  { type: "dict", name: "keys", signature: "dict.keys()", category: "参照", mutating: false, returns: "キーのビュー",
    description: "全てのキーのビューを返す", example: "d = {'a': 1, 'b': 2}\nprint(list(d.keys()))", result: "['a', 'b']" },
  { type: "dict", name: "values", signature: "dict.values()", category: "参照", mutating: false, returns: "値のビュー",
    description: "全ての値のビューを返す", example: "d = {'a': 1, 'b': 2}\nprint(list(d.values()))", result: "[1, 2]" },
  { type: "dict", name: "items", signature: "dict.items()", category: "参照", mutating: false, returns: "(キー,値)のビュー",
    description: "全ての (キー, 値) ペアのビューを返す", example: "d = {'a': 1}\nprint(list(d.items()))", result: "[('a', 1)]" },
  { type: "dict", name: "get", signature: "dict.get(key, default=None)", category: "参照", mutating: false, returns: "値 または default",
    description: "キーの値を返す。無ければ default を返す(KeyErrorにならない)", example: "d = {'a': 1}\nprint(d.get('b', 0))", result: "0" },
  { type: "dict", name: "pop", signature: "dict.pop(key)", category: "削除", mutating: true, returns: "削除した値",
    description: "キーを削除し、その値を返す", example: "d = {'a': 1, 'b': 2}\nprint(d.pop('a'))", result: "1" },
  { type: "dict", name: "popitem", signature: "dict.popitem()", category: "削除", mutating: true, returns: "(キー,値)",
    description: "末尾の (キー, 値) ペアを削除して返す", example: "d = {'a': 1, 'b': 2}\nprint(d.popitem())", result: "('b', 2)" },
  { type: "dict", name: "update", signature: "dict.update(other)", category: "追加", mutating: true, returns: "None",
    description: "別の辞書やペアでキーを追加・更新する", example: "d = {'a': 1}\nd.update({'b': 2})\nprint(d)", result: "{'a': 1, 'b': 2}" },
  { type: "dict", name: "setdefault", signature: "dict.setdefault(key, default)", category: "参照", mutating: true, returns: "値 または default",
    description: "キーがあれば値を返し、無ければ default を設定して返す", example: "d = {'a': 1}\nprint(d.setdefault('b', 9))", result: "9" },
  { type: "dict", name: "clear", signature: "dict.clear()", category: "削除", mutating: true, returns: "None",
    description: "全ての要素を削除して空にする", example: "d = {'a': 1}\nd.clear()\nprint(d)", result: "{}" },
  { type: "dict", name: "copy", signature: "dict.copy()", category: "コピー", mutating: false, returns: "新しい辞書",
    description: "浅いコピーを新しい辞書として返す", example: "d = {'a': 1}\nprint(d.copy())", result: "{'a': 1}" },
  { type: "dict", name: "fromkeys", signature: "dict.fromkeys(keys, value=None)", category: "生成", mutating: false, returns: "新しい辞書",
    description: "キー列から、全て同じ値を持つ新しい辞書を作る", example: "print(dict.fromkeys(['a', 'b'], 0))", result: "{'a': 0, 'b': 0}" },

  /* ===================== set ===================== */
  { type: "set", name: "add", signature: "set.add(x)", category: "追加", mutating: true, returns: "None",
    description: "要素を1つ追加する(既にあれば変化なし)", example: "s = {1, 2}\ns.add(3)\nprint(s == {1, 2, 3})", result: "True" },
  { type: "set", name: "update", signature: "set.update(iterable)", category: "追加", mutating: true, returns: "None",
    description: "複数の要素をまとめて追加する", example: "s = {1}\ns.update([2, 3])\nprint(s == {1, 2, 3})", result: "True" },
  { type: "set", name: "remove", signature: "set.remove(x)", category: "削除", mutating: true, returns: "None",
    description: "要素を削除する。無ければ KeyError", example: "s = {1, 2}\ns.remove(1)\nprint(s == {2})", result: "True" },
  { type: "set", name: "discard", signature: "set.discard(x)", category: "削除", mutating: true, returns: "None",
    description: "要素を削除する。無くてもエラーにならない", example: "s = {1, 2}\ns.discard(9)\nprint(s == {1, 2})", result: "True" },
  { type: "set", name: "pop", signature: "set.pop()", category: "削除", mutating: true, returns: "削除した要素",
    description: "任意の要素を1つ削除して返す", example: "s = {1}\nprint(s.pop())", result: "1" },
  { type: "set", name: "clear", signature: "set.clear()", category: "削除", mutating: true, returns: "None",
    description: "全ての要素を削除して空にする", example: "s = {1, 2}\ns.clear()\nprint(s)", result: "set()" },
  { type: "set", name: "union", signature: "set.union(other)", category: "集合演算", mutating: false, returns: "新しい集合",
    description: "和集合(どちらかに含まれる要素)を返す", example: "print({1, 2}.union({2, 3}) == {1, 2, 3})", result: "True" },
  { type: "set", name: "intersection", signature: "set.intersection(other)", category: "集合演算", mutating: false, returns: "新しい集合",
    description: "積集合(両方に含まれる要素)を返す", example: "print({1, 2}.intersection({2, 3}) == {2})", result: "True" },
  { type: "set", name: "difference", signature: "set.difference(other)", category: "集合演算", mutating: false, returns: "新しい集合",
    description: "差集合(自分にのみ含まれる要素)を返す", example: "print({1, 2}.difference({2, 3}) == {1})", result: "True" },
  { type: "set", name: "symmetric_difference", signature: "set.symmetric_difference(other)", category: "集合演算", mutating: false, returns: "新しい集合",
    description: "対称差(どちらか一方のみに含まれる要素)を返す", example: "print({1, 2}.symmetric_difference({2, 3}) == {1, 3})", result: "True" },
  { type: "set", name: "issubset", signature: "set.issubset(other)", category: "判定", mutating: false, returns: "bool",
    description: "自分が other の部分集合かを判定する", example: "print({1}.issubset({1, 2}))", result: "True" },
  { type: "set", name: "issuperset", signature: "set.issuperset(other)", category: "判定", mutating: false, returns: "bool",
    description: "自分が other の上位集合かを判定する", example: "print({1, 2}.issuperset({1}))", result: "True" },
  { type: "set", name: "isdisjoint", signature: "set.isdisjoint(other)", category: "判定", mutating: false, returns: "bool",
    description: "共通要素が全く無いかを判定する", example: "print({1, 2}.isdisjoint({3, 4}))", result: "True" },

  /* ===================== tuple ===================== */
  { type: "tuple", name: "count", signature: "tuple.count(x)", category: "参照", mutating: false, returns: "出現回数(int)",
    description: "要素 x の出現回数を返す(タプルは不変なので参照系のみ)", example: "t = (1, 2, 2, 3)\nprint(t.count(2))", result: "2" },
  { type: "tuple", name: "index", signature: "tuple.index(x)", category: "参照", mutating: false, returns: "位置(int)",
    description: "要素 x が最初に現れる位置を返す", example: "t = (10, 20, 30)\nprint(t.index(30))", result: "2" },

  /* ===================== str ===================== */
  { type: "str", name: "upper", signature: "str.upper()", category: "変換", mutating: false, returns: "新しい文字列",
    description: "全ての文字を大文字にした新しい文字列を返す", example: "print('abc'.upper())", result: "ABC" },
  { type: "str", name: "lower", signature: "str.lower()", category: "変換", mutating: false, returns: "新しい文字列",
    description: "全ての文字を小文字にした新しい文字列を返す", example: "print('ABC'.lower())", result: "abc" },
  { type: "str", name: "strip", signature: "str.strip()", category: "変換", mutating: false, returns: "新しい文字列",
    description: "前後の空白(や指定文字)を取り除いた文字列を返す", example: "print('  hi  '.strip())", result: "hi" },
  { type: "str", name: "replace", signature: "str.replace(old, new)", category: "変換", mutating: false, returns: "新しい文字列",
    description: "部分文字列 old を new に置き換えた文字列を返す", example: "print('a-b-c'.replace('-', '+'))", result: "a+b+c" },
  { type: "str", name: "split", signature: "str.split(sep=None)", category: "分割", mutating: false, returns: "リスト",
    description: "区切り文字で分割してリストを返す", example: "print('a,b,c'.split(','))", result: "['a', 'b', 'c']" },
  { type: "str", name: "join", signature: "str.join(iterable)", category: "結合", mutating: false, returns: "新しい文字列",
    description: "イテラブルの要素を区切り文字で連結した文字列を返す", example: "print('-'.join(['a', 'b', 'c']))", result: "a-b-c" },
  { type: "str", name: "find", signature: "str.find(sub)", category: "検索", mutating: false, returns: "位置(int) / -1",
    description: "部分文字列 sub の位置を返す。無ければ -1", example: "print('hello'.find('l'))", result: "2" },
  { type: "str", name: "startswith", signature: "str.startswith(prefix)", category: "判定", mutating: false, returns: "bool",
    description: "文字列が prefix で始まるかを判定する", example: "print('hello'.startswith('he'))", result: "True" },
  { type: "str", name: "endswith", signature: "str.endswith(suffix)", category: "判定", mutating: false, returns: "bool",
    description: "文字列が suffix で終わるかを判定する", example: "print('hello'.endswith('lo'))", result: "True" },
  { type: "str", name: "isdigit", signature: "str.isdigit()", category: "判定", mutating: false, returns: "bool",
    description: "全ての文字が数字かを判定する", example: "print('123'.isdigit())", result: "True" },
  { type: "str", name: "isalpha", signature: "str.isalpha()", category: "判定", mutating: false, returns: "bool",
    description: "全ての文字が英字かを判定する", example: "print('abc'.isalpha())", result: "True" },
  { type: "str", name: "zfill", signature: "str.zfill(width)", category: "整形", mutating: false, returns: "新しい文字列",
    description: "指定幅になるよう先頭を 0 で埋めた文字列を返す", example: "print('7'.zfill(3))", result: "007" }
];
