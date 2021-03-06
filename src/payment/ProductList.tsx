import React, { useCallback, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql';
import { getProducts, getProducts_getProducts } from '../__generated__/getProducts';
import './ProductList.scss';
import { MdCoffee, MdEuroSymbol, MdPhoto } from 'react-icons/md';
import { FaLeaf, FaWineBottle } from 'react-icons/fa';
import { GiChocolateBar } from 'react-icons/gi';
import Money from '../components/Money';
import { useAppDispatch } from '../store';
import { addProduct } from './paymentSlice';
import { StampType } from '../types/graphql-global';
import Stamp from '../components/Stamp';
import { SERVER_URI } from '..';
import { useTranslation } from 'react-i18next';

const groupBy = function <T>(array: T[], selector: (x: T) => string | null) {
  let map = new Map<string | null, T[]>();
  for (let x of array) {
    let key = selector(x);
    let list = map.get(key);
    if (list) {
      list.push(x);
    } else {
      map.set(key, [x]);
    }
  }
  return map;
};

export default function ProductList() {
  const { t } = useTranslation();
  const { loading, error, data } = useQuery<getProducts>(GET_PRODUCTS, {
    fetchPolicy: 'network-only',
  });

  let [tabIndex, setTabIndex] = useState(0);
  let [useGridLayout, setUseGridLayout] = useState(false);

  if (loading) {
    return <></>;
  }

  if (error) {
    return <></>;
  }

  if (!data) {
    return <></>;
  }

  const productGroup = groupBy(data.getProducts, (x) => x.category.name);

  const ordering = (name: string): number => {
    switch (name) {
      case 'Heißgetränke':
        return 2;
      case 'Kaltgetränke 0,5l':
        return 0;
      case 'Kaltgetränke 0,33l':
        return 1;
      case 'Snacks':
        return 3;
      default:
        return 999;
    }
  };

  let resultArray: {
    categoryId: string;
    categoryName: string;
    categoryOrder: number;
    productList: getProducts_getProducts[];
  }[] = [];
  for (let [categoryId, productList] of productGroup.entries()) {
    resultArray.push({
      categoryId: categoryId ?? '',
      categoryName: productList[0].category.name,
      categoryOrder: ordering(productList[0].category.name),
      productList,
    });
  }
  resultArray.sort((a, b) => a.categoryOrder - b.categoryOrder);

  let tabs: any[] = [];
  let content: any[] = [];
  let index = 0;
  for (let entry of resultArray) {
    let active = index === tabIndex;
    let currentTabIndex = index;

    let name = entry.categoryName;
    let icon: any | null = null;
    switch (name) {
      case 'Heißgetränke':
        icon = <MdCoffee />;
        name = t('payment.products.coffee');
        break;
      case 'Kaltgetränke 0,5l':
        icon = <FaWineBottle />;
        name = t('payment.products.bottle_500');
        break;
      case 'Kaltgetränke 0,33l':
        icon = <FaWineBottle className="small" />;
        name = t('payment.products.bottle_330');
        break;
      case 'Snacks':
        icon = <GiChocolateBar />;
        name = t('payment.products.snacks');
        break;
    }

    let onTabClick = (index: number) => {
      if (index === tabIndex) {
        setUseGridLayout(!useGridLayout);
      } else {
        setTabIndex(currentTabIndex);
      }
    };

    tabs.push(
      <div key={entry.categoryId} className={active ? 'active' : ''} onClick={() => onTabClick(currentTabIndex)}>
        {icon}
        <span>{name}</span>
      </div>
    );

    if (active) {
      entry.productList.sort((a, b) => a.name.localeCompare(b.name));
      for (let product of entry.productList) {
        content.push(<ProductItem key={product.id} product={product} />);
      }
    }

    index += 1;
  }

  return (
    <div className="product-list">
      <div className={'product-list-content ' + (useGridLayout ? 'grid-layout' : 'list-layout')}>{content}</div>
      <div className="product-list-tabs">{tabs}</div>
    </div>
  );
}

function ProductItem(props: { product: getProducts_getProducts }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const clickHandler = useCallback(() => {
    dispatch(
      addProduct({
        id: props.product.id,
        name: props.product.name,
        image: props.product.image,
        price: props.product.price,
        payWithStamps: StampType.NONE,
        couldBePaidWithStamps: props.product.payWithStamps,
        giveStamps: props.product.giveStamps,
      })
    );
  }, [props, dispatch]);

  let image;

  if (props.product) {
    if (props.product.image) {
      image = (
        <div>
          <img src={SERVER_URI + props.product.image} alt="" />
        </div>
      );
    } else {
      image = (
        <div>
          <MdPhoto />
        </div>
      );
    }
  } else {
    image = (
      <div>
        <MdEuroSymbol />
      </div>
    );
  }

  let stamps: any[] = [];
  if (props.product.giveStamps === StampType.COFFEE) {
    stamps.push(<Stamp key="coffee+1" value={1} type={StampType.COFFEE} />);
  } else if (props.product.giveStamps === StampType.BOTTLE) {
    stamps.push(<Stamp key="bottle+1" value={1} type={StampType.BOTTLE} />);
  }

  if (props.product.payWithStamps === StampType.COFFEE) {
    stamps.push(<Stamp key="coffee-10" value={t('payment.products.payable') as string} type={StampType.COFFEE} />);
  } else if (props.product.payWithStamps === StampType.BOTTLE) {
    stamps.push(<Stamp key="bottle-10" value={t('payment.products.payable') as string} type={StampType.BOTTLE} />);
  }

  let start = props.product.name.indexOf('(');
  let end = props.product.name.indexOf(')') + 1;

  let splitName = start >= 0 && end >= start;

  let flags = props.product.flags.map((flag) => flag.toLocaleLowerCase());

  let nameArray = [];

  if (splitName) {
    nameArray.push(<span key="name">{props.product.name.substring(0, start)}</span>);
    nameArray.push(<i key="splitName">{props.product.name.substring(start, end)}</i>);
  } else {
    nameArray.push(<span key="name">{props.product.name}</span>);
  }
  if (props.product.nickname) {
    nameArray.push(
      <div key="nickname" className="product-entry-nickname">
        {props.product.nickname}
      </div>
    );
  }
  if (flags.includes('bio')) {
    nameArray.push(
      <div key="bio" className="product-entry-bio">
        <FaLeaf />
      </div>
    );
  }
  if (flags.includes('vegan')) {
    nameArray.push(
      <div key="vegan" className="product-entry-vegan">
        <span>VEGAN</span>
      </div>
    );
  }

  let name = <div className="product-entry-name">{nameArray}</div>;

  return (
    <div onClick={clickHandler}>
      <div className="product-entry" data-id={props.product.id}>
        <div className="product-entry-image">
          <div>{image}</div>
        </div>
        <div className="product-entry-content">
          {name}
          <div className="product-entry-stamps">{stamps}</div>
        </div>
        <div className="product-entry-price">
          <Money value={props.product.price} />
        </div>
      </div>
    </div>
  );
}
