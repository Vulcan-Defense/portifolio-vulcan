import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";

const runButton = document.querySelector("#mlkem-run");
const status = document.querySelector("#mlkem-status");
const result = document.querySelector("#mlkem-result");

function bytes(value) {
  return new Intl.NumberFormat("pt-BR").format(value) + " B";
}

function sameBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

if (runButton && status && result) {
  runButton.addEventListener("click", () => {
    let keyPair;
    let encapsulated;
    let recoveredSecret;

    try {
      runButton.disabled = true;
      status.textContent = "Gerando material criptográfico local…";
      result.hidden = true;

      const startedAt = performance.now();
      keyPair = ml_kem768.keygen();
      encapsulated = ml_kem768.encapsulate(keyPair.publicKey);
      recoveredSecret = ml_kem768.decapsulate(encapsulated.cipherText, keyPair.secretKey);
      const duration = performance.now() - startedAt;
      const verified = sameBytes(encapsulated.sharedSecret, recoveredSecret);

      if (!verified) throw new Error("Os segredos compartilhados não coincidiram.");

      result.innerHTML = "<strong>Encapsulamento e decapsulamento validados.</strong> " +
        "Chave pública: " + bytes(keyPair.publicKey.length) +
        " · Ciphertext: " + bytes(encapsulated.cipherText.length) +
        " · Segredo compartilhado: " + bytes(encapsulated.sharedSecret.length) +
        " · Execução local: " + duration.toFixed(1).replace(".", ",") + " ms.";
      result.hidden = false;
      status.textContent = "Nenhuma chave ou segredo foi transmitido pelo site.";
    } catch (error) {
      status.textContent = "Não foi possível executar ML-KEM neste navegador. Atualize o navegador e tente novamente.";
      result.hidden = true;
      console.error("ML-KEM demonstration error", error);
    } finally {
      keyPair?.secretKey?.fill(0);
      keyPair?.publicKey?.fill(0);
      encapsulated?.cipherText?.fill(0);
      encapsulated?.sharedSecret?.fill(0);
      recoveredSecret?.fill(0);
      runButton.disabled = false;
    }
  });
}
