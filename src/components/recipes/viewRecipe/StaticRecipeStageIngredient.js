import React, { Fragment, useEffect, useState } from 'react';
import { db } from '../../../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import classes from './../RecipeStageIngredient.module.css';
import extraClasses from './../IngredientItem.module.css';

function StaticRecipeStageIngredient(props) {
  const [recipe, setRecipe] = useState(null);

  const getRecipeById = async (idRecette) => {
    const q = query(
      collection(db, 'recettes'),
      where('__name__', '==', idRecette)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setIngredients(getIngredients(doc.data().stages));
      // doc.data() is never undefined for query doc snapshots
      setRecipe(doc.data());
    });
  };

  useEffect(() => {
    if (props.currentStage.idRecette) {
      getRecipeById(props.currentStage.idRecette);
    }
  }, [props.currentStage.idRecette]);

  const addIngredientToIngredients = async (ingredient) => {
    const q = query(
      collection(db, 'ingredients'),
      where('__name__', '==', ingredient.idIng)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const fetchedIngredient = doc.data();
      setIngredients((prevState) => {
        return [
          ...prevState,
          {
            ...ingredient,
            nomIng: fetchedIngredient.nomIng,
            prixUnitaire: fetchedIngredient.prixUnitaire,
          },
        ];
      });
    });
  };

  const [ingredients, setIngredients] = useState([]);

  const getIngredients = (stages) => {
    for (const stage of stages) {
      if (stage.idRecette) {
        getRecipeById(stage.idRecette);
      } else {
        for (const ingredient of stage.ingredients) {
          addIngredientToIngredients(ingredient);
          //ingredients.push(ingredient);
        }
      }
    }
    return [];
  };

  return (
    <Fragment>
      {ingredients.length === 0 && (
        <p className={classes.noIngredient}>Aucun ingrédient</p>
      )}
      <div className={classes.ingredientList}>
        {ingredients.map((ingredient) => (
          <div className={extraClasses.ingredient}>
            <p className={extraClasses.ingredientInfo}>
              <span className={extraClasses.pill}>
                {ingredient.qte}
                {ingredient.nomUnite.toLowerCase()}
              </span>
              <span className={extraClasses.ingredientName}>
                {ingredient.nomIng}
              </span>
            </p>
          </div>
        ))}
      </div>
    </Fragment>
  );
}

export default StaticRecipeStageIngredient;
