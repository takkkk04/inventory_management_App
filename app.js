import {
    collection,
    doc,
    setDoc,
    getDocs,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

function setToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    $("#date").val(`${yyyy}-${mm}-${dd}`);
};

$(function () {
    
    setToday();

    async function loadInventory() {
        const snap = await getDocs(collection(window.db, "inventory"));

        const $tbody = $("#inventory_table tbody");
        $tbody.empty();

        const records = [];

        snap.forEach(docSnap => {
            const data = docSnap.data();
            records.push(data);
        });

        records.sort((a, b) =>{
            if (a.name === b.name){
                return a.spec.localeCompare(b.spec, "ja");
            }
            return a.name.localeCompare(b.name, "ja");
        });

        records.forEach(record =>{
            const rowHtml = `
            <tr>
                <td>${record.date}</td>
                <td>${record.name}</td>
                <td>${record.spec}</td>
                <td>${record.expire_ym}</td>
                <td>${record.quantity}</td>
            </tr>
            `;
        $tbody.append(rowHtml);
        });
    };

    loadInventory();

    $("#save_btn").on("click", async function () {
        const date = $("#date").val();
        const name = $("#name").val();
        const spec = $("#spec").val();
        const expireYm = $("#expire_ym").val();
        const quantity = $("#quantity").val();

        if (!date || !name || !spec || !expireYm || quantity === "") {
            alert("すべての項目を入力してください。");
            return;
        };

        const quantityNum = Number(quantity);
        if (!Number.isInteger(quantityNum) || quantityNum < 0) {
            alert("数量は0以上の整数で入力してください。");
            return;
        };

        const docId = `${date}_${name}_${spec}`;

        const record = {
            date: date, name: name, spec: spec, expire_ym: expireYm, quantity: quantity,
        };
        console.log("入力内容", record);

        await setDoc(
            doc(collection(window.db, "inventory"), docId), 
            record
        );

        await loadInventory();

        $("#inventory_form")[0].reset();

        setToday();

    });
});
